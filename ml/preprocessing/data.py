"""Load and verify the real dataset. Never imputes: NaN terrain values stay NaN."""
from __future__ import annotations
import sys
from dataclasses import dataclass
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import numpy as np
import pandas as pd
from config import DATA_PATH, FEATURES, CONTEXT_COLUMNS, TARGET, TERRAIN, FEATURE_RANGES


class DataQualityError(ValueError):
    pass


@dataclass
class Dataset:
    X: pd.DataFrame        # model features (NaN preserved)
    y: pd.Series
    context: pd.DataFrame  # ids / lat / lon / timestamp / state / sample_type (never features)

    @property
    def terrain_missing(self) -> pd.Series:
        return self.X[TERRAIN].isna().any(axis=1)


def load_dataset(path: Path | str = DATA_PATH) -> Dataset:
    df = pd.read_csv(path)
    need = CONTEXT_COLUMNS + FEATURES + [TARGET]
    missing = [c for c in need if c not in df.columns]
    if missing:
        raise DataQualityError(f"missing columns: {missing}")
    if df.event_id.duplicated().any():
        raise DataQualityError("duplicate event_id values")
    if not set(df[TARGET].unique()) <= {0, 1}:
        raise DataQualityError("target must be 0/1")
    if not (df.latitude.between(-90, 90).all() and df.longitude.between(-180, 180).all()):
        raise DataQualityError("invalid coordinates")
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="raise")
    for f in FEATURES:
        df[f] = pd.to_numeric(df[f], errors="raise")
        lo, hi = FEATURE_RANGES[f]
        s = df[f].dropna()
        if (lo is not None and (s < lo).any()) or (hi is not None and (s > hi).any()):
            raise DataQualityError(f"{f} outside physical range {FEATURE_RANGES[f]}")
    # terrain triplet must be all-present or all-missing (as documented); refuse partial rows silently
    t = df[TERRAIN].isna()
    if not t.sum(axis=1).isin([0, 3]).all():
        raise DataQualityError("partially-missing terrain triplet")
    df = df.sort_values(["timestamp", "event_id"]).reset_index(drop=True)
    return Dataset(X=df[FEATURES].copy(), y=df[TARGET].astype(int).copy(), context=df[CONTEXT_COLUMNS].copy())


def verify_dataset(ds: Dataset) -> dict:
    y, X, c = ds.y, ds.X, ds.context
    return {
        "n_rows": int(len(y)), "n_positive": int(y.sum()), "n_background": int((1 - y).sum()),
        "duplicate_event_ids": int(c.event_id.duplicated().sum()),
        "missing_by_feature": {k: int(v) for k, v in X.isna().sum().items()},
        "terrain_missing_rows": int(ds.terrain_missing.sum()),
        "terrain_missing_by_class": {int(k): int(v) for k, v in ds.terrain_missing.groupby(y).sum().items()},
        "lat_range": [float(c.latitude.min()), float(c.latitude.max())],
        "lon_range": [float(c.longitude.min()), float(c.longitude.max())],
        "timestamp_range": [str(c.timestamp.min()), str(c.timestamp.max())],
        "sample_type_counts": c.sample_type.value_counts().to_dict(),
        "states": c.state.value_counts().to_dict(),
    }
