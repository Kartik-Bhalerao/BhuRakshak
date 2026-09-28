"""Central configuration for the BhuRakshak AI/ML risk engine (real-data version)."""
from pathlib import Path

ML_ROOT = Path(__file__).resolve().parent
DATA_PATH = ML_ROOT / "data" / "raw" / "bhuRakshak_final_ml_dataset.csv"
ARTIFACT_DIR = ML_ROOT / "artifacts" / "model"
OUTPUT_DIR = ML_ROOT / "artifacts" / "outputs"
MODEL_PATH = ARTIFACT_DIR / "model.joblib"
MODEL_CARD_PATH = ARTIFACT_DIR / "model_card.json"
FALLBACK_MODEL_PATH = ARTIFACT_DIR / "model_no_terrain.joblib"
EXPERIMENTS_PATH = OUTPUT_DIR / "experiments.json"

RANDOM_SEED = 42
MODEL_VERSION_PREFIX = "bhurakshak-risk"

TARGET = "landslide_occurrence"
# Columns carried for validation grouping / provenance. NEVER model inputs.
CONTEXT_COLUMNS = ["event_id", "latitude", "longitude", "timestamp", "state", "sample_type",
                   "source_event_date_precision"]
RAINFALL = ["rainfall_1h", "rainfall_24h", "rainfall_7d"]
TERRAIN = ["elevation", "slope", "aspect"]
SOIL = ["soil_moisture"]          # NASA POWER / MERRA-2 GWETTOP surface-soil-wetness PROXY, not SMAP
FEATURES = RAINFALL + TERRAIN + SOIL
FEATURES_NO_TERRAIN = RAINFALL + SOIL

# Physical/validity ranges used by inference-time validation (from the data dictionary).
FEATURE_RANGES = {
    "rainfall_1h": (0, None), "rainfall_24h": (0, None), "rainfall_7d": (0, None),
    "elevation": (-500, 9000), "slope": (0, 90), "aspect": (0, 360), "soil_moisture": (0, 1),
}

# Risk levels: APPLICATION thresholds on risk_score = probability * 100. Not scientifically validated.
RISK_BANDS = [("Low", 0, 30), ("Medium", 30, 60), ("High", 60, 80), ("Critical", 80, 100)]


def risk_level(score: float) -> str:
    if not (0 <= score <= 100):
        raise ValueError(f"risk_score must be within [0, 100], got {score}")
    for name, lo, hi in RISK_BANDS:
        if lo <= score < hi or (name == "Critical" and score == 100):
            return name
    raise RuntimeError("unreachable")

# ---- validation settings ----
SPATIAL_BLOCK_DEG = 1.0        # ~110 km blocks (backgrounds were placed >=20 km from positives)
SPATIAL_BUFFER_KM = 20.0       # training rows within this distance of any test row are dropped
N_SPATIAL_FOLDS = 5
TEMPORAL_TEST_YEARS = [2013, 2014, 2015, 2016]   # expanding-window: train on years < test year
TEMPORAL_EMBARGO_DAYS = 7      # rainfall_7d looks back 7 days -> drop train rows this close to test start
DECISION_THRESHOLD = 0.5       # fixed a priori (balanced 1:1 design); not tuned on test data
N_BOOTSTRAP = 1000

# ---- model hyper-parameters: fixed a priori, conservative (n=702, weak signal). NOT tuned. ----
XGB_PARAMS = dict(n_estimators=200, max_depth=3, learning_rate=0.05, subsample=0.8,
                  colsample_bytree=0.8, min_child_weight=5, reg_lambda=5.0,
                  eval_metric="logloss", random_state=RANDOM_SEED, n_jobs=1)
# Interim stand-in (only used if xgboost is not importable). Comparable in spirit, NOT equivalent.
HGB_PARAMS = dict(max_iter=200, max_depth=3, learning_rate=0.05, min_samples_leaf=20,
                  l2_regularization=5.0, early_stopping=False, random_state=RANDOM_SEED)
