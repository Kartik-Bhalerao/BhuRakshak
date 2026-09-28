"""Run E1 / E2 / E3 under spatial and temporal validation and write artifacts/outputs/experiments.json.

E1  native-missing : all rows, terrain NaN preserved and handled natively by the model.
E2  complete-case  : only rows with elevation+slope+aspect present (train AND test).
E3  no-terrain     : DIAGNOSTIC reference, rainfall+soil features only, all rows.
Comparisons are made on the COMMON complete-case test rows so the test population is identical.
"""
from __future__ import annotations
import sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
from sklearn.base import clone
from config import FEATURES, FEATURES_NO_TERRAIN, OUTPUT_DIR, EXPERIMENTS_PATH, RANDOM_SEED, SPATIAL_BLOCK_DEG, \
    SPATIAL_BUFFER_KM, TEMPORAL_TEST_YEARS, TEMPORAL_EMBARGO_DAYS, N_SPATIAL_FOLDS, DECISION_THRESHOLD
from preprocessing.data import load_dataset, verify_dataset
from models.backend import make_model
from evaluation.validation import SCHEMES, block_ids
from evaluation.evaluate import metrics, block_bootstrap_ci
from sklearn.metrics import roc_auc_score


def run_scheme(ds, splits, exp, base_model, y_override=None):
    """Return OOF prediction array (NaN where the row was not predicted by this experiment)."""
    y = ds.y.to_numpy() if y_override is None else y_override
    cc = ~ds.terrain_missing.to_numpy()
    feats = FEATURES_NO_TERRAIN if exp == "E3_no_terrain" else FEATURES
    oof = np.full(len(y), np.nan)
    fold_auc = []
    for s in splits:
        tr, te = s["train"], s["test"]
        if exp == "E2_complete_case":
            tr, te = tr[cc[tr]], te[cc[te]]      # terrain-missing rows cannot be predicted by E2
        if len(tr) == 0 or len(te) == 0 or len(np.unique(y[tr])) < 2:
            continue
        m = clone(base_model).fit(ds.X.iloc[tr][feats], y[tr])
        oof[te] = m.predict_proba(ds.X.iloc[te][feats])[:, 1]
        if len(np.unique(y[te])) == 2:
            fold_auc.append(float(roc_auc_score(y[te], oof[te])))
    return oof, fold_auc


def summarize(ds, oof, mask, groups, with_ci=True):
    idx = np.where(mask & ~np.isnan(oof))[0]
    y = ds.y.to_numpy()[idx]
    out = metrics(y, oof[idx])
    if with_ci and len(idx):
        out.update(block_bootstrap_ci(y, oof[idx], groups[idx]))
    return out


def main():
    ds = load_dataset()
    base_model, info = make_model()
    groups = block_ids(ds.context)
    cc = ~ds.terrain_missing.to_numpy()
    y = ds.y.to_numpy()
    res = {"backend": info, "data_verification": verify_dataset(ds),
           "settings": {"spatial_block_deg": SPATIAL_BLOCK_DEG, "spatial_buffer_km": SPATIAL_BUFFER_KM,
                        "n_spatial_folds": N_SPATIAL_FOLDS, "temporal_test_years": TEMPORAL_TEST_YEARS,
                        "temporal_embargo_days": TEMPORAL_EMBARGO_DAYS, "decision_threshold": DECISION_THRESHOLD,
                        "random_seed": RANDOM_SEED},
           "schemes": {}}
    for sname, fn in SCHEMES.items():
        splits = fn(ds.context)
        tested = np.zeros(len(y), bool)
        for s in splits:
            tested[s["test"]] = True
        sc = {"folds": [{"name": s["name"], "n_train_after_buffer": int(len(s["train"])), "n_test": int(len(s["test"])),
                         "buffer_dropped": s["buffer_dropped"]} for s in splits], "experiments": {}}
        oofs = {}
        for exp in ["E1_native_missing", "E2_complete_case", "E3_no_terrain"]:
            oof, fauc = run_scheme(ds, splits, exp, base_model)
            oofs[exp] = oof
            e = {"per_fold_roc_auc": fauc,
                 "per_fold_roc_auc_mean": float(np.mean(fauc)) if fauc else None,
                 "per_fold_roc_auc_std": float(np.std(fauc)) if fauc else None,
                 "pooled_all_predicted_rows": summarize(ds, oof, tested, groups),
                 "pooled_common_complete_case_rows": summarize(ds, oof, tested & cc, groups)}
            sc["experiments"][exp] = e
        # Missingness diagnostic on E1: what does it predict for terrain-missing test rows?
        o1 = oofs["E1_native_missing"]; miss = tested & ~cc & ~np.isnan(o1)
        if miss.sum():
            sc["e1_missing_terrain_diagnostic"] = {
                "n_terrain_missing_rows_tested": int(miss.sum()),
                "n_positive_among_them": int(y[miss].sum()),
                "mean_predicted_probability_missing_rows": float(o1[miss].mean()),
                "mean_predicted_probability_complete_rows": float(o1[tested & cc & ~np.isnan(o1)].mean()),
                "fraction_predicted_positive_missing_rows": float((o1[miss] >= DECISION_THRESHOLD).mean())}
        res["schemes"][sname] = sc
        print(f"[{sname}] done", flush=True)

    # Label-permutation sanity check (spatial scheme): pipeline should give ~0.5 AUC on shuffled labels.
    rng = np.random.default_rng(RANDOM_SEED)
    yp = rng.permutation(y)
    splits = SCHEMES["spatial_block_cv_buffered"](ds.context)
    o, _ = run_scheme(ds, splits, "E1_native_missing", base_model, y_override=yp)
    res["sanity_permuted_labels_spatial_E1"] = {"roc_auc": float(roc_auc_score(yp, o)), "expected_if_no_leak": "~0.5"}

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    EXPERIMENTS_PATH.write_text(json.dumps(res, indent=2))
    print("wrote", EXPERIMENTS_PATH)


if __name__ == "__main__":
    main()
