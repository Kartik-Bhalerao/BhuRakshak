"""Real-data demo. Rows come from the real dataset. NOTE: the final model was trained on ALL complete-terrain
rows, so these predictions are IN-SAMPLE and illustrative only — they are NOT validation. Validation results
are in artifacts/outputs/experiments.json."""
import sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
from config import FEATURES
from preprocessing.data import load_dataset
from inference.inference import predict_risk, MissingTerrainError
from models.model_loader import load_model_card


def show(title, ds, i, **kw):
    row = ds.X.iloc[i].to_dict(); ctx = ds.context.iloc[i]
    print(f"\n=== {title} ===")
    print(f"row: {ctx.event_id} | {ctx.state} | {str(ctx.timestamp)[:10]} | true label: {int(ds.y.iloc[i])} ({ctx.sample_type})")
    print("input:", {k: (None if np.isnan(v) else round(v, 3)) for k, v in row.items()})
    try:
        r = predict_risk({k: (None if np.isnan(v) else v) for k, v in row.items()}, **kw)
    except MissingTerrainError as e:
        print("MissingTerrainError:", e); return
    print(f"probability={r['probability']:.4f}  risk_score={r['risk_score']}  risk_level={r['risk_level']}  variant={r['model_variant']}")
    for t in r["top_contributing_features"]:
        print(f"  {t['feature']:14s} = {t['value']:<10.3f} SHAP {t['shap_value']:+.3f} log-odds  {t['direction']}")
    return r


def main():
    card = load_model_card(); ds = load_dataset()
    print("model_version:", card["model_version"]); print("backend:", card["backend"])
    if not card["is_xgboost"]:
        print("!! INTERIM STAND-IN — NOT XGBoost (xgboost not installable in the build environment)")
    print("IN-SAMPLE demonstration on real rows — not validation.")
    miss = np.where(ds.terrain_missing.to_numpy())[0][0]
    pos = np.where((ds.y.to_numpy() == 1) & ~ds.terrain_missing.to_numpy())[0][10]
    bg = np.where((ds.y.to_numpy() == 0) & ~ds.terrain_missing.to_numpy())[0][10]
    r = show("reported landslide event (complete terrain)", ds, pos)
    show("background sample (complete terrain)", ds, bg)
    show("terrain missing -> default behaviour", ds, miss)
    show("terrain missing -> explicit fallback", ds, miss, allow_no_terrain_fallback=True)
    print("\nfull JSON for first example:\n", json.dumps(r, indent=2))

if __name__ == "__main__":
    main()
