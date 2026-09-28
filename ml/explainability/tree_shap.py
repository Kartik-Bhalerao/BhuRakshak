"""Tree-model Shapley explanations (log-odds / margin space).

* XGBoost model  -> shap.TreeExplainer (the real TreeSHAP library implementation).
* Interim HGB stand-in -> `exact_tree_shapley`: exact Shapley values of the same
  path-dependent value function TreeSHAP computes (feature absent from coalition S => average
  both children weighted by training-sample counts; NaN follows the learned missing direction),
  obtained by enumerating all 2^M coalitions (M<=8 here). Not the `shap` package; verified by the
  local-accuracy identity  base_value + sum(phi) == raw model margin  (see tests).
"""
from __future__ import annotations
import sys
from itertools import combinations
from math import factorial
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
import pandas as pd
from models.backend import is_xgboost_model


def _hgb_trees(model):
    trees = [p.nodes for it in model._predictors for p in it]
    if model.n_trees_per_iteration_ != 1:
        raise NotImplementedError("binary classifier expected")
    baseline = float(np.ravel(model._baseline_prediction)[0])
    return trees, baseline


def _tree_used_mask(nodes) -> int:
    m = 0
    for n in nodes:
        if not n["is_leaf"]:
            m |= 1 << int(n["feature_idx"])
    return m


def _tree_value(nodes, x, mask: int) -> float:
    def rec(i):
        n = nodes[i]
        if n["is_leaf"]:
            return float(n["value"])
        f = int(n["feature_idx"])
        l, r = int(n["left"]), int(n["right"])
        if mask >> f & 1:
            xv = x[f]
            go_left = bool(n["missing_go_to_left"]) if np.isnan(xv) else xv <= n["num_threshold"]
            return rec(l if go_left else r)
        cl, cr = float(nodes[l]["count"]), float(nodes[r]["count"])
        return (cl * rec(l) + cr * rec(r)) / (cl + cr)
    return rec(0)


def exact_tree_shapley(model, x: np.ndarray):
    """Return (base_value, phi[M]) in raw-margin (log-odds) space for one sample."""
    trees, baseline = _hgb_trees(model)
    M = len(x)
    used = [_tree_used_mask(t) for t in trees]
    cache = [dict() for _ in trees]
    v = np.zeros(1 << M)
    for mask in range(1 << M):
        tot = baseline
        for k, t in enumerate(trees):
            key = mask & used[k]
            if key not in cache[k]:
                cache[k][key] = _tree_value(t, x, key)
            tot += cache[k][key]
        v[mask] = tot
    phi = np.zeros(M)
    for i in range(M):
        others = [j for j in range(M) if j != i]
        for size in range(M):
            w = factorial(size) * factorial(M - size - 1) / factorial(M)
            for S in combinations(others, size):
                m = sum(1 << j for j in S)
                phi[i] += w * (v[m | (1 << i)] - v[m])
    return float(v[0]), phi


def raw_margin(model, X: pd.DataFrame) -> np.ndarray:
    if is_xgboost_model(model):
        return model.get_booster().predict(__import__("xgboost").DMatrix(X), output_margin=True)
    return model.decision_function(X)


def explain(model, X_row: pd.DataFrame) -> dict:
    """Explain ONE row. Returns method info, base_value, per-feature SHAP values (margin space)."""
    if len(X_row) != 1:
        raise ValueError("explain() takes exactly one row")
    cols = list(X_row.columns)
    if is_xgboost_model(model):
        import shap
        ex = shap.TreeExplainer(model)
        sv = np.asarray(ex.shap_values(X_row))[0]
        base = float(np.ravel(ex.expected_value)[0])
        method, lib = "shap.TreeExplainer (TreeSHAP)", True
    else:
        base, sv = exact_tree_shapley(model, X_row.iloc[0].to_numpy(dtype=float))
        method, lib = "exact path-dependent tree Shapley (enumeration; interim stand-in for shap.TreeExplainer)", False
    return {"method": method, "is_shap_library": lib, "space": "log-odds (raw margin)",
            "base_value": base, "shap_values": {c: float(v) for c, v in zip(cols, sv)}}
