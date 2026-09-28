BhuRakshak — Backend
FastAPI backend for the BhuRakshak landslide risk intelligence platform:
risk scoring, weather ingestion, field reports, exposure analysis, and
alerts, backed by PostgreSQL/PostGIS.

Scope of this build:
Real, working APIs— every endpoint is implemented and wired to the
 database, not a mock.
Real, working risk calculation— a documented rule-based baseline
  (not a stub, not fake numbers) for susceptibility, dynamic hazard, fusion,
  confidence, and forecast projection. Every score is explainable
  component-by-component.
Stubbed advanced model: InSAR deformation, optical change detection,
  and citizen-image CV are represented in the schema
  (`ModelVersion.model_type`) with `deployment_status=NOT_IMPLEMENTED`, so
  the API can honestly report "this evidence layer doesn't exist yet"
  instead of silently omitting it or faking a result.
  
Scoring : 
A proper ML model (XGBoost/LightGBM/Random Forest with spatial
cross-validation) needs a labeled training dataset, which doesn't exist yet.
Rather than fabricate a "trained" model, this backend implements a
transparent, weighted formula using real terrain and rainfall features
(slope, historical proximity, land cover, drainage density for
susceptibility; rainfall intensity, antecedent rainfall, forecast trend,
soil moisture for hazard).

This is a deliberate, swappable seam: `app/services/scoring.py` has one
function per model (`score_susceptibility`, `score_dynamic_hazard`). Once
labeled data exists, replace the body of each function with real model
inference — everything upstream (fusion, forecast, API, confidence) keeps
working unchanged, because the input/output contract doesn't change.

Every score is registered against a `ModelVersion` row with
`deployment_status=RULE_BASED_BASELINE` — never `TRAINED` — so nobody
downstream mistakes this for a validated model.

Architecture:

Rainfall input (Open-Meteo / IMD later)
        |
        v
WeatherObservation (stored, timestamped, source-tagged)
        |
        v
score_dynamic_hazard()  <---- RiskCell static terrain features ---- score_susceptibility()
        |                                                                    |
        +-----------------------------+--------------------------------------+
                                       v
                                 fuse_risk()  <-- evidence_boost() (nearby verified events / high-severity reports)
                                       |
                                       v
                        risk_score, probability_estimate (UNCALIBRATED),
                        confidence_score/label, risk_level
                                       |
                       +---------------+----------------+
                       v                v                v
                /risk/explanation  /risk/forecast   exposure.py + response_priority.py
                                                            |
                                                            v
                                                  alert_engine.py -> Alert rows

Setup

bash
cp .env.example .env          # edit JWT_SECRET_KEY at minimum
docker compose up -d db redis
pip install -r requirements.txt
uvicorn app.main:app --reload  # creates tables on startup (dev convenience;
                                # swap to Alembic before this touches a shared DB)


Run the demo:
bash
PYTHONPATH=. python scripts/seed_demo.py

Expected output: one risk cell, scored once under light rainfall and again
under heavy escalating rainfall, with the risk_score/level visibly moving
between the two runs.

Run tests:
bash
pip install pytest
PYTHONPATH=. pytest tests/ -v


API docs (once running): http://localhost:8000/docs

Auth :
JWT bearer auth with three roles (authority, field, citizen). POST /auth/register then POST /auth/login (OAuth2 password flow -- send username=email, password). Citizen report submission works anonymously (get_optional_user) since field/citizen users may not always be authenticated.
