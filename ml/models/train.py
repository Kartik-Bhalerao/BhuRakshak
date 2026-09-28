"""Train and save the final artifacts from the real dataset.

FINAL MODEL SELECTION (methodology, not "best metric"):
  E2 complete-case is used for deployment. The E1 native-NaN model was shown (evaluation/run_experiments.py)
  to score terrain-missing rows as near-zero risk, because 45/46 of those rows are background samples by
  construction (DEM tile gaps). That is a data-construction artifact and would give false reassurance for
  real locations lacking DEM coverage. E1 and E2 are statistically indistinguishable on the common rows.
  A rainfall+soil-only fallback (E3, near-chance skill) is saved separately and only used when explicitly
  requested for locations without terrain.
Usage: python models/train.py
"""
from __future__ import annotations
import sys, json, hashlib, platform
from datetime import datetime, timezone
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import joblib, numpy as np
from config import *
from preprocessing.data import load_dataset, verify_dataset
from models.backend import make_model
from explainability.tree_shap import explain
from evaluation.validation import SCHEMES
from evaluation.run_experiments import run_scheme
from sklearn.metrics import brier_score_loss


def main():
    ds = load_dataset()
    cc = ~ds.terrain_missing.to_numpy()
    y = ds.y.to_numpy()
    model, info = make_model()
    model.fit(ds.X[cc][FEATURES], y[cc])                           # E2: complete-case, all 7 features
    fallback, _ = make_model()
    fallback.fit(ds.X[FEATURES_NO_TERRAIN], y)                      # E3: rainfall + soil only, all rows

    # Global attribution on training rows (descriptive only, NOT causal, NOT out-of-sample)
    Xc = ds.X[cc][FEATURES]
    rows = np.random.default_rng(RANDOM_SEED).choice(len(Xc), size=min(200, len(Xc)), replace=False)
    mean_abs = {f: 0.0 for f in FEATURES}
    for i in rows:
        for f, v in explain(model, Xc.iloc[[i]])["shap_values"].items():
            mean_abs[f] += abs(v) / len(rows)

    # Out-of-fold calibration of the E2 recipe under spatial validation
    splits = SCHEMES["spatial_block_cv_buffered"](ds.context)
    oof, _ = run_scheme(ds, splits, "E2_complete_case", make_model()[0])
    ok = ~np.isnan(oof)
    bins = np.linspace(0, 1, 6)
    rel = []
    for lo, hi in zip(bins[:-1], bins[1:]):
        m = ok & (oof >= lo) & ((oof < hi) | (hi == 1.0))
        rel.append({"bin": [round(lo, 1), round(hi, 1)], "n": int(m.sum()),
                    "mean_predicted": float(oof[m].mean()) if m.sum() else None,
                    "observed_positive_rate": float(y[m].mean()) if m.sum() else None})

    data_hash = hashlib.sha256(DATA_PATH.read_bytes()).hexdigest()[:8]
    tag = "xgb" if info["is_xgboost"] else "hgb-standin"
    version = f"{MODEL_VERSION_PREFIX}-{tag}-e2cc-{datetime.now(timezone.utc):%Y%m%d}-{data_hash}"
    exp = json.loads(EXPERIMENTS_PATH.read_text()) if EXPERIMENTS_PATH.exists() else None

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH); joblib.dump(fallback, FALLBACK_MODEL_PATH)
    card = {
        "model_version": version, "backend": info["backend"], "is_xgboost": info["is_xgboost"],
        "hyperparameters": info["params"], "hyperparameters_tuned": False,
        "trained_at_utc": datetime.now(timezone.utc).isoformat(), "python": platform.python_version(),
        "training_data": {"file": DATA_PATH.name, "sha256_8": data_hash, "verification": verify_dataset(ds)},
        "final_model": {"variant": "E2_complete_case", "features": FEATURES, "n_train_rows": int(cc.sum()),
                        "n_positive": int(y[cc].sum()), "n_background": int((1 - y[cc]).sum())},
        "fallback_model": {"variant": "E3_no_terrain", "features": FEATURES_NO_TERRAIN, "n_train_rows": int(len(y)),
                           "note": "Only used with allow_no_terrain_fallback=True; near-chance skill in validation."},
        "selection_rationale": ("E2 chosen for deployment because E1 (native NaN) learned terrain-missing => background "
                                "(45/46 missing rows are background by construction); see experiments.json."),
        "feature_notes": {"soil_moisture": "NASA POWER/MERRA-2 GWETTOP surface-soil-wetness proxy, NOT SMAP volumetric soil moisture",
                          "rainfall": "NASA POWER hourly PRECTOTCORR (MERRA-2 reanalysis) summed over windows ending strictly before T; not IMERG",
                          "terrain": "Copernicus GLO-30 DSM; slope/aspect derived locally (Horn 3x3)"},
        "label_semantics": "1 = reported landslide (NASA GLC); 0 = controlled background sample (>=20 km from any positive), NOT confirmed absence",
        "probability_semantics": ("Model trained on a 1:1 case/background design. Output probability is a relative score under that design, "
                                  "NOT the real-world probability that a landslide occurs."),
        "risk_thresholds": {"bands": RISK_BANDS, "status": "application defaults; NOT scientifically validated"},
        "global_mean_abs_shap_train_subset_logodds": dict(sorted(mean_abs.items(), key=lambda kv: -kv[1])),
        "oof_calibration_spatial_cv_E2": {"reliability_bins": rel, "brier": float(brier_score_loss(y[ok], oof[ok]))},
        "validation_summary_source": str(EXPERIMENTS_PATH.name) if exp else None,
    }
    MODEL_CARD_PATH.write_text(json.dumps(card, indent=2))
    print("backend:", info["backend"]); print("version:", version)
    print("final model rows:", int(cc.sum()), "| fallback rows:", len(y))
    print("global mean|SHAP| (train subset, log-odds):", json.dumps(card["global_mean_abs_shap_train_subset_logodds"], indent=0))
    print("calibration bins:", rel)


if __name__ == "__main__":
    main()
