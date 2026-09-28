"""Tests for preprocessing, validation splits, thresholds, model loading, SHAP, missing terrain, inference.
Requires trained artifacts:  python models/train.py
Run: pytest tests/    (or, where pytest is unavailable: python tests/_manual_runner.py)"""
import sys, math, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
import pandas as pd
import pytest
from config import FEATURES, FEATURES_NO_TERRAIN, TERRAIN, RISK_BANDS, risk_level, SPATIAL_BUFFER_KM, TEMPORAL_EMBARGO_DAYS, DATA_PATH
from preprocessing.data import load_dataset, verify_dataset, DataQualityError
from evaluation.validation import spatial_splits, temporal_splits, block_ids, haversine_km
from evaluation.evaluate import metrics
from models.model_loader import load_model, load_fallback_model, load_model_card
from models.backend import is_xgboost_model
from explainability.tree_shap import explain, raw_margin
from inference.inference import predict_risk, validate_features, InferenceInputError, MissingTerrainError

VALID = dict(rainfall_1h=0.5, rainfall_24h=20.0, rainfall_7d=90.0, elevation=800.0, slope=20.0, aspect=180.0, soil_moisture=0.85)


# ---------------- preprocessing ----------------
def test_dataset_loads_with_expected_counts_and_no_imputation():
    ds = load_dataset(); v = verify_dataset(ds)
    assert (v["n_rows"], v["n_positive"], v["n_background"]) == (702, 351, 351)
    assert v["duplicate_event_ids"] == 0
    assert v["terrain_missing_rows"] == 46
    assert ds.X[TERRAIN].isna().sum().tolist() == [46, 46, 46]          # NaN preserved, not imputed


def test_features_exclude_identifiers_and_target():
    ds = load_dataset()
    assert list(ds.X.columns) == FEATURES
    assert not {"latitude", "longitude", "timestamp", "landslide_occurrence", "sample_type", "event_id"} & set(ds.X.columns)
    assert "sample_type" in ds.context.columns                            # provenance preserved


def test_loader_rejects_partially_missing_terrain_and_bad_target():
    df = pd.read_csv(DATA_PATH)
    with tempfile.TemporaryDirectory() as d:
        bad = df.copy(); bad.loc[0, "slope"] = np.nan; bad.loc[0, ["elevation", "aspect"]] = 1.0
        bad.loc[bad.index[df.elevation.isna()][0], "elevation"] = 5.0    # partial triplet
        (Path(d) / "a.csv").write_text(bad.to_csv(index=False))
        with pytest.raises(DataQualityError):
            load_dataset(Path(d) / "a.csv")
        bad2 = df.copy(); bad2.loc[0, "landslide_occurrence"] = 2
        (Path(d) / "b.csv").write_text(bad2.to_csv(index=False))
        with pytest.raises(DataQualityError):
            load_dataset(Path(d) / "b.csv")


# ---------------- validation / leakage ----------------
def test_spatial_splits_have_no_overlap_disjoint_blocks_and_buffer():
    ds = load_dataset(); ctx = ds.context; blocks = block_ids(ctx)
    lat, lon = ctx.latitude.to_numpy(), ctx.longitude.to_numpy()
    for s in spatial_splits(ctx):
        assert not set(s["train"]) & set(s["test"])
        assert not set(blocks[s["train"]]) & set(blocks[s["test"]])       # whole blocks held out
        dmin = haversine_km(lat[s["train"]], lon[s["train"]], lat[s["test"]], lon[s["test"]]).min()
        assert dmin >= SPATIAL_BUFFER_KM


def test_temporal_splits_never_train_on_the_future():
    ds = load_dataset(); ts = pd.to_datetime(ds.context.timestamp, utc=True)
    for s in temporal_splits(ds.context):
        assert ts.iloc[s["train"]].max() < ts.iloc[s["test"]].min() - pd.Timedelta(days=TEMPORAL_EMBARGO_DAYS) + pd.Timedelta(seconds=1)
        assert not set(s["train"]) & set(s["test"])
    for s in temporal_splits(ds.context, buffer_km=SPATIAL_BUFFER_KM):
        lat, lon = ds.context.latitude.to_numpy(), ds.context.longitude.to_numpy()
        assert haversine_km(lat[s["train"]], lon[s["train"]], lat[s["test"]], lon[s["test"]]).min() >= SPATIAL_BUFFER_KM


def test_metrics_guard_single_class():
    m = metrics([1, 1, 1], [0.9, 0.8, 0.7]); assert m["roc_auc"] is None and m["pr_auc"] is None
    m = metrics([0, 1, 0, 1], [0.1, 0.9, 0.4, 0.6]); assert m["roc_auc"] == 1.0 and m["confusion_matrix"]["tp"] == 2


# ---------------- risk thresholds ----------------
def test_risk_thresholds_boundaries():
    for s, lvl in [(0, "Low"), (29.99, "Low"), (30, "Medium"), (59.99, "Medium"), (60, "High"),
                   (79.99, "High"), (80, "Critical"), (100, "Critical")]:
        assert risk_level(s) == lvl
    assert [b[0] for b in RISK_BANDS] == ["Low", "Medium", "High", "Critical"]


def test_risk_level_rejects_out_of_range():
    for bad in (-0.01, 100.01):
        with pytest.raises(ValueError):
            risk_level(bad)


# ---------------- model loading ----------------
def test_models_load_and_card_is_honest_about_backend():
    m, fb, card = load_model(), load_fallback_model(), load_model_card()
    assert hasattr(m, "predict_proba") and hasattr(fb, "predict_proba")
    assert card["is_xgboost"] == is_xgboost_model(m)                       # never claim XGBoost falsely
    assert ("XGBClassifier" in card["backend"]) == card["is_xgboost"]
    assert card["final_model"]["features"] == FEATURES and card["fallback_model"]["features"] == FEATURES_NO_TERRAIN
    assert "NOT SMAP" in card["feature_notes"]["soil_moisture"]


# ---------------- SHAP ----------------
def test_shap_values_are_additive_to_the_model_margin():
    ds = load_dataset(); model = load_model()
    Xc = ds.X[~ds.terrain_missing][FEATURES]
    for i in (0, 50, 300):
        row = Xc.iloc[[i]]; ex = explain(model, row)
        assert list(ex["shap_values"]) == FEATURES
        total = ex["base_value"] + sum(ex["shap_values"].values())
        assert abs(total - float(raw_margin(model, row)[0])) < 1e-4      # local accuracy (float32-safe for real XGBoost)


def test_shap_unused_or_constant_feature_gets_zero():
    ds = load_dataset(); X = ds.X[~ds.terrain_missing][FEATURES].copy(); X["aspect"] = 1.0
    from models.backend import make_model
    m, _ = make_model(); m.fit(X, ds.y[~ds.terrain_missing])
    assert abs(explain(m, X.iloc[[3]])["shap_values"]["aspect"]) < 1e-12


# ---------------- inference ----------------
def test_inference_output_schema_and_bounds():
    r = predict_risk(VALID)
    for k in ("probability", "risk_score", "risk_level", "top_contributing_features", "model_version"):
        assert k in r
    assert 0.0 <= r["probability"] <= 1.0 and 0.0 <= r["risk_score"] <= 100.0
    assert r["risk_score"] == round(r["probability"] * 100, 2)
    assert r["risk_level"] == risk_level(r["risk_score"])
    assert 1 <= len(r["top_contributing_features"]) <= 3
    t = r["top_contributing_features"]; assert abs(t[0]["shap_value"]) >= abs(t[-1]["shap_value"])
    assert set(t[0]) == {"feature", "value", "shap_value", "direction"}
    assert r["model_version"] == load_model_card()["model_version"] and r["terrain_missing"] is False


def test_inference_rejects_bad_input():
    for mut in ({"rainfall_24h": -1}, {"soil_moisture": 1.5}, {"slope": 120}, {"aspect": 400}, {"rainfall_1h": "abc"},
                {"rainfall_7d": float("inf")}, {"rainfall_1h": None}, {"bogus": 1}):
        with pytest.raises(InferenceInputError):
            predict_risk({**VALID, **mut})
    with pytest.raises(InferenceInputError):
        predict_risk({k: v for k, v in VALID.items() if k != "soil_moisture"})


# ---------------- missing terrain handling ----------------
def test_missing_terrain_is_rejected_by_default_for_none_nan_and_absent_keys():
    for terr in ({"elevation": None, "slope": None, "aspect": None},
                 {"elevation": float("nan"), "slope": float("nan"), "aspect": float("nan")}):
        with pytest.raises(MissingTerrainError):
            predict_risk({**VALID, **terr})
    with pytest.raises(MissingTerrainError):
        predict_risk({k: v for k, v in VALID.items() if k not in TERRAIN})


def test_missing_terrain_fallback_is_explicit_and_flagged():
    p = {**VALID, "elevation": None, "slope": None, "aspect": None}
    r = predict_risk(p, allow_no_terrain_fallback=True)
    assert r["terrain_missing"] is True and r["model_variant"] == "no_terrain_fallback"
    assert set(r["explanation"]["shap_values"]) == set(FEATURES_NO_TERRAIN)
    assert any("near-chance" in w for w in r["warnings"])
    assert 0 <= r["probability"] <= 1


def test_partial_terrain_is_rejected_not_imputed():
    with pytest.raises(InferenceInputError):
        predict_risk({**VALID, "slope": None}, allow_no_terrain_fallback=True)


def test_native_nan_is_not_silently_imputed_in_validation():
    v = validate_features({**VALID, "elevation": None, "slope": None, "aspect": None})
    assert all(math.isnan(v[f]) for f in TERRAIN)
