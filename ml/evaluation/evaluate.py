"""Metrics computed only from real out-of-fold predict_proba outputs."""
from __future__ import annotations
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
from sklearn.metrics import (precision_score, recall_score, f1_score, roc_auc_score,
                             average_precision_score, confusion_matrix)
from config import DECISION_THRESHOLD, N_BOOTSTRAP, RANDOM_SEED


def metrics(y, p, thr: float = DECISION_THRESHOLD) -> dict:
    y, p = np.asarray(y), np.asarray(p)
    out = {"n": int(len(y)), "n_pos": int(y.sum()), "n_neg": int(len(y) - y.sum()), "threshold": thr}
    if len(y) == 0:
        return out
    yh = (p >= thr).astype(int)
    tn, fp, fn, tp = confusion_matrix(y, yh, labels=[0, 1]).ravel()
    out.update(precision=float(precision_score(y, yh, zero_division=0)),
               recall=float(recall_score(y, yh, zero_division=0)),
               f1=float(f1_score(y, yh, zero_division=0)),
               confusion_matrix={"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
               pr_auc_baseline_prevalence=float(y.mean()))
    if 0 < y.sum() < len(y):   # AUCs are only valid when both classes are present
        out["roc_auc"] = float(roc_auc_score(y, p))
        out["pr_auc"] = float(average_precision_score(y, p))
    else:
        out["roc_auc"] = out["pr_auc"] = None
    return out


def block_bootstrap_ci(y, p, groups, n=N_BOOTSTRAP, seed=RANDOM_SEED) -> dict:
    """95% CI for pooled ROC-AUC / PR-AUC, resampling spatial blocks (rows in a block move together)."""
    y, p, groups = np.asarray(y), np.asarray(p), np.asarray(groups)
    rng = np.random.default_rng(seed)
    ub = np.unique(groups)
    idx_by = {g: np.where(groups == g)[0] for g in ub}
    roc, pr = [], []
    for _ in range(n):
        pick = rng.choice(ub, size=len(ub), replace=True)
        ii = np.concatenate([idx_by[g] for g in pick])
        if 0 < y[ii].sum() < len(ii):
            roc.append(roc_auc_score(y[ii], p[ii])); pr.append(average_precision_score(y[ii], p[ii]))
    q = lambda a: [float(np.quantile(a, .025)), float(np.quantile(a, .975))] if a else None
    return {"roc_auc_ci95": q(roc), "pr_auc_ci95": q(pr), "n_boot_valid": len(roc)}
