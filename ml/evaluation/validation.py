"""Leakage-aware validation splits (no naive random split is provided).

Spatial leakage: rows are bucketed into SPATIAL_BLOCK_DEG blocks; whole blocks go to the same
fold (GroupKFold). Additionally, training rows within SPATIAL_BUFFER_KM of ANY test row are dropped,
so a training point just across a block boundary cannot stand in for a test point.

Temporal leakage: expanding-window / rolling-origin. Test = one calendar year Y; train = rows strictly
before (Jan 1 of Y minus TEMPORAL_EMBARGO_DAYS). The embargo covers rainfall_7d's 7-day look-back.
Optionally the same spatial buffer is applied on top ("strict" scheme).
"""
from __future__ import annotations
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
import pandas as pd
from sklearn.model_selection import GroupKFold
from config import (SPATIAL_BLOCK_DEG, SPATIAL_BUFFER_KM, N_SPATIAL_FOLDS,
                    TEMPORAL_TEST_YEARS, TEMPORAL_EMBARGO_DAYS)


def block_ids(ctx: pd.DataFrame, deg: float = SPATIAL_BLOCK_DEG) -> np.ndarray:
    la = np.floor(ctx.latitude.to_numpy() / deg).astype(int)
    lo = np.floor(ctx.longitude.to_numpy() / deg).astype(int)
    return np.array([f"{a}_{b}" for a, b in zip(la, lo)])


def haversine_km(lat1, lon1, lat2, lon2) -> np.ndarray:
    la1, lo1, la2, lo2 = map(np.radians, (lat1[:, None], lon1[:, None], lat2[None, :], lon2[None, :]))
    a = np.sin((la2 - la1) / 2) ** 2 + np.cos(la1) * np.cos(la2) * np.sin((lo2 - lo1) / 2) ** 2
    return 6371.0 * 2 * np.arcsin(np.sqrt(a))


def _buffer_train(ctx, train_idx, test_idx, km):
    if km <= 0 or len(train_idx) == 0:
        return train_idx, 0
    lat, lon = ctx.latitude.to_numpy(), ctx.longitude.to_numpy()
    d = haversine_km(lat[train_idx], lon[train_idx], lat[test_idx], lon[test_idx]).min(axis=1)
    keep = d >= km
    return train_idx[keep], int((~keep).sum())


def spatial_splits(ctx, n_folds=N_SPATIAL_FOLDS, buffer_km=SPATIAL_BUFFER_KM):
    groups = block_ids(ctx)
    out = []
    for k, (tr, te) in enumerate(GroupKFold(n_splits=n_folds).split(np.zeros(len(ctx)), groups=groups)):
        tr, dropped = _buffer_train(ctx, tr, te, buffer_km)
        out.append({"name": f"spatial_fold_{k}", "train": tr, "test": te, "buffer_dropped": dropped})
    return out


def temporal_splits(ctx, test_years=TEMPORAL_TEST_YEARS, embargo_days=TEMPORAL_EMBARGO_DAYS, buffer_km=0.0):
    ts = pd.to_datetime(ctx.timestamp, utc=True)
    out = []
    for y in test_years:
        start = pd.Timestamp(f"{y}-01-01", tz="UTC")
        te = np.where((ts >= start) & (ts < start + pd.DateOffset(years=1)))[0]
        tr = np.where(ts < start - pd.Timedelta(days=embargo_days))[0]
        tr, dropped = _buffer_train(ctx, tr, te, buffer_km)
        out.append({"name": f"train<{y}_test={y}", "train": tr, "test": te, "buffer_dropped": dropped})
    return out


SCHEMES = {
    "spatial_block_cv_buffered": lambda ctx: spatial_splits(ctx),
    "temporal_rolling_origin": lambda ctx: temporal_splits(ctx),
    "temporal_plus_spatial_buffer": lambda ctx: temporal_splits(ctx, buffer_km=SPATIAL_BUFFER_KM),
}
