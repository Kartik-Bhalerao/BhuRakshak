"""Model factory. Uses xgboost.XGBClassifier when importable; otherwise an INTERIM stand-in.

The stand-in exists only so validation/inference/SHAP code can run in environments where
xgboost cannot be installed. It is NEVER reported as XGBoost: every artifact stores `backend`.
"""
from __future__ import annotations
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import XGB_PARAMS, HGB_PARAMS

XGB_NAME = "xgboost.XGBClassifier"
HGB_NAME = "sklearn.ensemble.HistGradientBoostingClassifier (INTERIM STAND-IN — NOT XGBoost)"


def xgboost_available() -> bool:
    try:
        import xgboost  # noqa: F401
        return True
    except ImportError:
        return False


def make_model(force_backend: str | None = None):
    """Return (unfitted_estimator, backend_info). force_backend in {None,'xgboost','hgb'}."""
    use_xgb = xgboost_available() if force_backend is None else force_backend == "xgboost"
    if use_xgb:
        from xgboost import XGBClassifier
        return XGBClassifier(**XGB_PARAMS), {"backend": XGB_NAME, "is_xgboost": True, "params": dict(XGB_PARAMS)}
    from sklearn.ensemble import HistGradientBoostingClassifier
    return HistGradientBoostingClassifier(**HGB_PARAMS), {"backend": HGB_NAME, "is_xgboost": False, "params": dict(HGB_PARAMS)}


def is_xgboost_model(model) -> bool:
    return type(model).__module__.startswith("xgboost")
