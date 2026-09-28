# BhuRakshak AI/ML Risk Engine

Landslide risk scoring for the North Eastern Region (NER) of India from rainfall, terrain and a surface-soil-wetness
proxy, with per-prediction feature attributions.

## Status (read this first)

| Item | Status |
|---|---|
| Real dataset (702 rows) | Used. No synthetic data anywhere in this module. |
| Pipeline (verify → validate → train → save → infer → explain) | Implemented and executed. |
| **Model actually trained** | **`sklearn` `HistGradientBoostingClassifier` — an INTERIM STAND-IN, NOT XGBoost.** `xgboost` could not be installed in the environment this was built in (no network). |
| **Attributions actually computed** | **Exact tree-Shapley by coalition enumeration — NOT the `shap` package.** `shap` could not be installed either. Verified by additivity (base + Σφ = model margin, error ≈ 1e‑16). |
| XGBoost / `shap.TreeExplainer` code paths | Written, **never executed**. Selected automatically when the packages are importable. Regenerate all artifacts (see "Switching to real XGBoost"). |
| Tests | 17/17 pass (run via a manual runner because `pytest` was also unavailable). |
| Predictive skill | **Weak; not demonstrated to beat chance under strict validation** (see Evaluation). |
| Backend / GIS integration | **Not implemented / not verified.** The only interface is the Python function `inference.inference.predict_risk`. |
| Real-time operation | **Not implemented.** No live data pipeline exists. |

This is a software prototype of the scoring pipeline. It is **not** production-ready and **not** a validated landslide predictor.

## Data

`data/raw/bhuRakshak_final_ml_dataset.csv` (produced by a separate data-engineering process; see `data/raw/DATA_DICTIONARY.md`,
`DATA_SOURCE_REPORT.md`). Verified by `preprocessing/data.py` on load:

- 702 rows = 351 reported NASA Global Landslide Catalog events (label 1) + 351 background samples (label 0), 1:1.
- 0 duplicate event IDs, 0 invalid coordinates, 0 missing timestamps. Lat 22.0–29.0, lon 88.05–96.93, 2007‑05‑23 → 2016‑10‑15, 8 NER states.
- `sample_type` is preserved (in `context`, never a feature).

**Label 0 is a controlled background sample, NOT a confirmed absence.** Each is ≥20 km from every known positive, inside the same
state, with its date matched to a positive. Under-reporting in the inventory means some "background" points may have had landslides.
Because background points are pushed ≥20 km from positives, and reported events cluster near roads/settlements (median nearest-positive
distance 2.7 km), features such as elevation can partly encode *where events get reported* rather than landslide susceptibility.

| Feature | Meaning / source | Present |
|---|---|---|
| `rainfall_1h/24h/7d` | mm accumulated in windows ending strictly before T. NASA POWER hourly `PRECTOTCORR` (MERRA-2 reanalysis, **not IMERG**). | 702/702 |
| `elevation`, `slope`, `aspect` | Copernicus GLO-30 DSM; slope/aspect derived locally (Horn 3×3). | 656/702 |
| `soil_moisture` | NASA POWER `GWETTOP`, previous UTC day: dimensionless MERRA-2 **surface-soil-wetness proxy. NOT SMAP volumetric soil moisture.** | 702/702 |

Timestamps are date-level (the 172 rows showing a non-midnight time still have `date_only` precision; features were aligned to the start of the date).

**Missing terrain is not random:** 45 of the 46 missing-terrain rows are background samples (only 1 is a positive), because those
locations fell outside public DEM tile coverage. The 46 rows are never imputed. This matters (next section).

## Method

### Experiments (`evaluation/run_experiments.py`)
- **E1 native-missing:** all 702 rows; terrain left as NaN and handled natively by the tree model.
- **E2 complete-case:** only the 656 rows with terrain (train and test).
- **E3 no-terrain (diagnostic only):** rainfall + soil features only, all rows.

Hyper-parameters are fixed a priori and **not tuned** (small n, weak signal). Decision threshold for hard-label metrics is fixed at 0.5
(data are balanced), not tuned on test data. No class weighting (E1 is 1:1; E2 training is 306 background/350 positive).

### Validation (no naive random split)
- **Spatial:** rows bucketed into 1°×1° blocks; whole blocks held out (`GroupKFold`, 5 folds); training rows within 20 km of any test row are additionally dropped (buffer).
- **Temporal:** expanding-window rolling origin. Test = 2013, 2014, 2015, 2016 in turn; train = strictly earlier, minus a 7-day embargo (matches `rainfall_7d` look-back).
- **Temporal + spatial buffer:** the temporal scheme with the 20 km buffer added (strictest).
- Leakage properties are unit-tested (no train/test overlap, disjoint blocks, minimum train–test distance ≥ 20 km, no training on the future).
- Metrics are pooled out-of-fold; 95% CIs come from block bootstrap (1000 resamples of spatial blocks). ROC-AUC is only reported when both classes are present.
- **Sanity check:** shuffling the labels through the spatial pipeline gives ROC-AUC 0.530 (expected ≈0.5), i.e. no sign the pipeline itself leaks.

## Evaluation (actual results; backend = interim stand-in, so **these are not XGBoost numbers**)

Comparison is on the *common complete-terrain test rows* so E1/E2/E3 are scored on identical rows. Confusion matrix is TN/FP/FN/TP at threshold 0.5.
PR-AUC chance level is 0.5 (balanced).

**Spatial block CV (1° blocks, 5 folds, 20 km buffer)** — common complete-terrain test rows

| Experiment | n | ROC-AUC (95% block-bootstrap CI) | PR-AUC | Precision | Recall | F1 | TN/FP/FN/TP |
|---|---|---|---|---|---|---|---|
| E1_native_missing | 656 | 0.590 (0.47–0.68) | 0.603 | 0.578 | 0.674 | 0.623 | 134/172/114/236 |
| E2_complete_case | 656 | 0.586 (0.47–0.69) | 0.612 | 0.573 | 0.697 | 0.629 | 124/182/106/244 |
| E3_no_terrain | 656 | 0.548 (0.48–0.61) | 0.556 | 0.569 | 0.569 | 0.569 | 155/151/151/199 |

E1 on *all* its test rows (incl. terrain-missing): n=702, ROC-AUC 0.641 (0.54–0.73). E1 mean predicted probability: terrain-missing rows **0.046** vs complete rows **0.560**; 0% of the 46 missing rows predicted positive (1 were true events).

E2 per-fold ROC-AUC: [0.64, 0.73, 0.45, 0.5, 0.59]

**Temporal rolling-origin (test 2013–2016, 7-day embargo)** — common complete-terrain test rows

| Experiment | n | ROC-AUC (95% block-bootstrap CI) | PR-AUC | Precision | Recall | F1 | TN/FP/FN/TP |
|---|---|---|---|---|---|---|---|
| E1_native_missing | 326 | 0.613 (0.45–0.76) | 0.644 | 0.568 | 0.728 | 0.638 | 57/96/47/126 |
| E2_complete_case | 326 | 0.629 (0.47–0.77) | 0.664 | 0.578 | 0.728 | 0.645 | 61/92/47/126 |
| E3_no_terrain | 326 | 0.560 (0.46–0.65) | 0.593 | 0.581 | 0.561 | 0.571 | 83/70/76/97 |

E1 on *all* its test rows (incl. terrain-missing): n=346, ROC-AUC 0.658 (0.51–0.82). E1 mean predicted probability: terrain-missing rows **0.039** vs complete rows **0.604**; 0% of the 20 missing rows predicted positive (0 were true events).

E2 per-fold ROC-AUC: [0.65, 0.38, 0.7, 0.65]

**Temporal + 20 km spatial buffer (strictest)** — common complete-terrain test rows

| Experiment | n | ROC-AUC (95% block-bootstrap CI) | PR-AUC | Precision | Recall | F1 | TN/FP/FN/TP |
|---|---|---|---|---|---|---|---|
| E1_native_missing | 326 | 0.460 (0.34–0.59) | 0.514 | 0.515 | 0.694 | 0.591 | 40/113/53/120 |
| E2_complete_case | 326 | 0.463 (0.35–0.60) | 0.518 | 0.526 | 0.699 | 0.600 | 44/109/52/121 |
| E3_no_terrain | 326 | 0.557 (0.44–0.66) | 0.595 | 0.593 | 0.497 | 0.541 | 94/59/87/86 |

E1 on *all* its test rows (incl. terrain-missing): n=346, ROC-AUC 0.522 (0.39–0.68). E1 mean predicted probability: terrain-missing rows **0.056** vs complete rows **0.616**; 0% of the 20 missing rows predicted positive (0 were true events).

E2 per-fold ROC-AUC: [0.61, 0.22, 0.5, 0.39]

### What the results show
1. **E1's native-NaN handling learned a data-construction artifact.** It assigns the terrain-missing rows a mean probability of ~0.04–0.06
   (0% predicted positive) versus ~0.56–0.62 for complete rows, because missing terrain almost always meant "background." E1's all-rows AUC
   (0.641 spatial) is inflated relative to its AUC on complete rows (0.590); the difference is the artifact, not landslide skill.
   On the common rows E1 and E2 are statistically indistinguishable.
2. **Skill is weak and unstable.** Spatial ROC-AUC ≈ 0.59 with a CI that includes 0.5; temporal ≈ 0.63, CI includes 0.5; under the strictest
   scheme E2 falls to 0.46 (CI includes 0.5, single folds as low as 0.22). Per-fold AUC swings widely. The rainfall+soil-only variant (E3) is near chance everywhere (0.55–0.56, CIs include 0.5), and is *better* than the terrain model under the strictest scheme, suggesting terrain-based signal does not transfer across space and time.
3. **Probabilities are over-confident and not better than trivial.** Out-of-fold, predictions of 0.8–1.0 had a 67% observed positive rate and 0.6–0.8 had 56%. The out-of-fold Brier score is 0.256 (a constant 0.5 prediction scores 0.25).

## Final model and why (`models/train.py`)
**Final = E2 complete-case, trained on all 656 rows with terrain.** Chosen on methodology, not on metrics (E1 and E2 tie on the common rows):
the native-NaN model would score any real location lacking DEM coverage as ~4% risk purely because of the missingness pattern — false reassurance.
A rainfall+soil-only fallback (E3, trained on all 702 rows) is saved separately and is used **only** when the caller passes `allow_no_terrain_fallback=True`.

Artifacts (`artifacts/model/`): `model.joblib`, `model_no_terrain.joblib`, `model_card.json` (backend, `is_xgboost`, hyper-parameters, data hash, version, calibration, limitations), plus `artifacts/outputs/experiments.json` (all validation numbers above).
Current version string: `bhurakshak-risk-hgb-standin-e2cc-20260928-6e54a80e` (`hgb-standin` in the name marks the stand-in).

## Risk scoring
`P = model.predict_proba(X)[:, 1]` · `risk_score = round(P × 100, 2)`

| Score | Level |
|---|---|
| < 30 | Low |
| 30 – < 60 | Medium |
| 60 – < 80 | High |
| ≥ 80 | Critical |

These are **application defaults, not scientifically validated thresholds**, and are centralised in `config.py`. Because the model is trained on a
1:1 case/background design, `P` is a *relative score under that design*, **not** the real-world probability of a landslide.

## Explanations
Per prediction, attributions are in log-odds (raw margin) space and satisfy base value + Σ φᵢ = model margin. Interim implementation:
exact Shapley values of the tree path-dependent value function by enumerating all 2^M coalitions (`explainability/tree_shap.py`); with real XGBoost the
same function calls `shap.TreeExplainer`. Attributions describe *what the model used*, not physical causes. On the training data, elevation has the largest mean
|SHAP| (see `model_card.json`) — treat that cautiously given the reporting-bias caveat above.

## Inference
```python
from inference.inference import predict_risk
predict_risk({"rainfall_1h": 0.1, "rainfall_24h": 3.67, "rainfall_7d": 39.2,
              "elevation": 468.77, "slope": 28.02, "aspect": 333.55, "soil_moisture": 0.73})
```
Returns `probability`, `risk_score`, `risk_level`, `top_contributing_features` (top 3: feature, value, shap_value, direction), `model_version`, and also
`model_variant`, `terrain_missing`, `model_backend`, `is_xgboost`, full `explanation`, and `warnings`. Input is validated (required keys, numeric, finite,
physical ranges); `latitude/longitude/timestamp` may be passed but are ignored (not model inputs).
**Missing terrain:** `elevation/slope/aspect` must be given together. If all are missing (`None`/NaN/absent) the call raises `MissingTerrainError`, unless
`allow_no_terrain_fallback=True`, which uses the near-chance fallback and flags it in the result. Partially missing terrain is rejected, never imputed.

## Integration
`predict_risk` is a plain Python function; Backend can import it. **No HTTP API is provided and no Backend/GIS contract has been verified** (Backend internals were never
inspected). GIS would need a coordinate → feature-extraction step that does not exist here.

## Run
```bash
cd ml && pip install -r requirements.txt
python evaluation/run_experiments.py   # validation experiments -> artifacts/outputs/experiments.json
python models/train.py                 # final artifacts + model_card.json
python scripts/run_demo.py             # real-data demo (IN-SAMPLE rows; illustrative, not validation)
pytest tests/                          # or: python tests/_manual_runner.py
```
Random seed 42; hyper-parameters in `config.py`.

### Switching to real XGBoost
On a machine where `pip install xgboost shap` works, run the four commands above unchanged. `models/backend.py` then uses `xgboost.XGBClassifier` and
`explain()` uses `shap.TreeExplainer`. **Do not reuse any number in this README for XGBoost**: the metrics above came from the stand-in with
different hyper-parameters. Regenerate them, re-read `experiments.json`, and re-check the E1 missingness diagnostic (XGBoost's default-direction handling may behave differently). The `xgboost`/`shap` branches have never been executed.

## Limitations
- Interim stand-in model and explainer (above); XGBoost/TreeSHAP code paths untested.
- Weak, unstable skill; CIs include 0.5 in most settings; strictest scheme is below chance. Not a validated predictor.
- Label 0 is not confirmed absence; reporting bias and spatial clustering of events may drive apparent signal (esp. elevation).
- Small data (702 rows; 351 events from 2007–2016) and **date-level** timestamps; no time-of-day resolution.
- Rainfall is MERRA-2 reanalysis (coarse grid; 235 rows share identical rainfall triples), not satellite IMERG. Soil feature is a surface-wetness proxy, not SMAP.
- Copernicus GLO-30 is a DSM; 46 locations lack terrain and are not imputed.
- Probabilities are over-confident, not real-world probabilities; risk bands are unvalidated application defaults.
- No live data feed, no monitoring, no Backend/GIS integration, no HTTP API.

## Layout
```
ml/  config.py · requirements.txt
  data/raw/           real dataset + data dictionary/source report
  preprocessing/data.py        load + verify (no imputation)
  models/             backend.py (XGB or stand-in) · train.py · model_loader.py
  evaluation/         validation.py (spatial/temporal splits) · evaluate.py · run_experiments.py
  explainability/tree_shap.py  shap.TreeExplainer or exact enumeration
  inference/inference.py       predict_risk()
  scripts/run_demo.py · tests/test_pipeline.py (+ _manual_runner.py)
  artifacts/model/ · artifacts/outputs/experiments.json
```
