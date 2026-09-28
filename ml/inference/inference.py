"""Inference: feature vector -> probability, risk score, risk level, SHAP attribution.

Input (dict): rainfall_1h, rainfall_24h, rainfall_7d, elevation, slope, aspect, soil_moisture
              (latitude/longitude/timestamp may be passed but are ignored: they are not model inputs).
              elevation/slope/aspect may be None/NaN ONLY together ("terrain missing").

Terrain missing:
  default -> MissingTerrainError (the final model was trained on complete-terrain rows only; the
             native-NaN variant was rejected because it learned missingness=background).
  allow_no_terrain_fallback=True -> rainfall+soil-only fallback model; result is flagged and carries a
             warning that this variant has near-chance validation skill.
Probability is a relative score under the 1:1 case/background training design, NOT a real-world event
probability. Risk levels are application thresholds, NOT scientifically validated.
"""
from __future__ import annotations
import sys, math
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import pandas as pd
from config import FEATURES, FEATURES_NO_TERRAIN, TERRAIN, FEATURE_RANGES, risk_level
from models.model_loader import load_model, load_fallback_model, load_model_card
from explainability.tree_shap import explain

IGNORED_CONTEXT_KEYS = {"latitude", "longitude", "timestamp", "event_id"}
TOP_K = 3


class InferenceInputError(ValueError):
    pass


class MissingTerrainError(InferenceInputError):
    pass


def _num(v):
    if v is None:
        return math.nan
    if isinstance(v, bool):
        raise InferenceInputError("boolean is not a valid numeric feature")
    try:
        return float(v)
    except (TypeError, ValueError):
        raise InferenceInputError(f"non-numeric value {v!r}")


def validate_features(payload: dict) -> dict:
    unknown = set(payload) - set(FEATURES) - IGNORED_CONTEXT_KEYS
    if unknown:
        raise InferenceInputError(f"unexpected keys: {sorted(unknown)}")
    vals = {}
    for f in FEATURES:
        if f not in payload:
            if f in TERRAIN:
                vals[f] = math.nan         # absent terrain key == missing terrain
                continue
            raise InferenceInputError(f"missing required feature: {f}")
        v = _num(payload[f])
        if math.isinf(v):
            raise InferenceInputError(f"{f} must be finite")
        if not math.isnan(v):
            lo, hi = FEATURE_RANGES[f]
            if (lo is not None and v < lo) or (hi is not None and v > hi):
                raise InferenceInputError(f"{f}={v} outside valid range {FEATURE_RANGES[f]}")
        vals[f] = v
    for f in FEATURES:
        if f not in TERRAIN and math.isnan(vals[f]):
            raise InferenceInputError(f"{f} may not be missing (only terrain may be)")
    n_missing = sum(math.isnan(vals[f]) for f in TERRAIN)
    if n_missing not in (0, 3):
        raise InferenceInputError("elevation, slope and aspect must be provided together or all be missing")
    return vals


def predict_risk(payload: dict, allow_no_terrain_fallback: bool = False, top_k: int = TOP_K) -> dict:
    vals = validate_features(payload)
    terrain_missing = math.isnan(vals["elevation"])
    card = load_model_card()
    warnings = [f"probability is a relative score from a 1:1 case/background design, not a real-world event probability",
                "risk levels are application thresholds, not scientifically validated"]
    if terrain_missing:
        if not allow_no_terrain_fallback:
            raise MissingTerrainError("terrain (elevation, slope, aspect) is missing; the final model requires it. "
                                      "Pass allow_no_terrain_fallback=True to use the rainfall+soil-only fallback.")
        model, feats, variant = load_fallback_model(), FEATURES_NO_TERRAIN, "no_terrain_fallback"
        warnings.append("terrain missing: rainfall+soil-only fallback used; this variant showed near-chance skill in validation")
    else:
        model, feats, variant = load_model(), FEATURES, "complete_terrain"
    X = pd.DataFrame([[vals[f] for f in feats]], columns=feats)
    p = float(model.predict_proba(X)[0, 1])
    if not (0.0 <= p <= 1.0) or math.isnan(p):
        raise RuntimeError(f"invalid probability {p}")
    score = round(p * 100, 2)
    level = risk_level(score)
    ex = explain(model, X)
    ranked = sorted(ex["shap_values"].items(), key=lambda kv: -abs(kv[1]))
    top = [{"feature": f, "value": vals[f], "shap_value": s,
            "direction": "increases_risk" if s > 0 else "decreases_risk"} for f, s in ranked[:top_k]]
    warnings.append("soil_moisture is a MERRA-2 GWETTOP surface-wetness proxy, not SMAP volumetric soil moisture")
    if not card["is_xgboost"]:
        warnings.append(f"backend is an interim stand-in, NOT XGBoost: {card['backend']}")
    if not ex["is_shap_library"]:
        warnings.append("attributions from exact tree Shapley enumeration, not the shap package")
    return {"probability": p, "risk_score": score, "risk_level": level, "top_contributing_features": top,
            "model_version": card["model_version"], "model_variant": variant, "terrain_missing": terrain_missing,
            "model_backend": card["backend"], "is_xgboost": card["is_xgboost"],
            "explanation": {"method": ex["method"], "space": ex["space"], "base_value": ex["base_value"],
                            "shap_values": ex["shap_values"]},
            "warnings": warnings}
