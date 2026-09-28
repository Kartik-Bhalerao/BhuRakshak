from __future__ import annotations
import sys, json
from functools import lru_cache
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import joblib
from config import MODEL_PATH, FALLBACK_MODEL_PATH, MODEL_CARD_PATH


class ModelNotTrainedError(RuntimeError):
    pass


def _need(p: Path):
    if not p.exists():
        raise ModelNotTrainedError(f"{p} not found. Run `python models/train.py` first.")


@lru_cache(maxsize=1)
def load_model():
    _need(MODEL_PATH); return joblib.load(MODEL_PATH)


@lru_cache(maxsize=1)
def load_fallback_model():
    _need(FALLBACK_MODEL_PATH); return joblib.load(FALLBACK_MODEL_PATH)


@lru_cache(maxsize=1)
def load_model_card() -> dict:
    _need(MODEL_CARD_PATH); return json.loads(MODEL_CARD_PATH.read_text())
