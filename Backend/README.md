# BhuRakshak — Backend

FastAPI backend for the BhuRakshak landslide risk intelligence platform
(blueprint reference: NER-SHIELD Technical Blueprint, Sections 5, 9, 11, 12,
17, 18, 20, 21, 22, 24, 25, 27, 33).

## Scope of this build: "middle ground"

- **Real, working APIs** for every endpoint in Section 21.
- **Real, working risk calculation** — a documented rule-based baseline
  (not a stub, not fake numbers) for susceptibility, dynamic hazard, fusion,
  confidence, and forecast projection. Every score is explainable
  component-by-component.
- **Stubbed advanced models**: InSAR deformation, optical change detection,
  and citizen-image CV (Section 6.3–6.5) are represented in the schema
  (`ModelVersion.model_type`) with `deployment_status=NOT_IMPLEMENTED` so the
  API can honestly say "this evidence layer doesn't exist yet" rather than
  silently omitting it or faking a result — see Section 27, "What NOT to
  Claim."

## Why rule-based scoring instead of a trained ML model

Section 6.1/6.2 call for XGBoost/LightGBM/Random Forest models with spatial
cross-validation. That needs a labeled training dataset (Section 17), which
the team doesn't have yet. Rather than fabricate a "trained" model, this
backend implements a transparent, weighted formula using the *same candidate
features* the blueprint lists (slope, historical proximity, land cover,
drainage density for susceptibility; rainfall intensity, antecedent rainfall,
forecast trend, soil moisture for hazard).

This is a deliberate, swappable seam: `app/services/scoring.py` has one
function per model (`score_susceptibility`, `score_dynamic_hazard`). Once you
have labeled data, replace the body of each function with real model
inference — everything upstream (fusion, forecast, API, confidence) keeps
working unchanged, because the input/output contract doesn't change.

Every score is registered against a `ModelVersion` row with
`deployment_status=RULE_BASED_BASELINE` — never `TRAINED` — so nobody
downstream mistakes this for a validated model (Section 27).

## Architecture

```
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
```

## Project layout

```
app/
  core/         config, async DB session, JWT auth + RBAC
  models/       SQLAlchemy ORM -- all 8 entities from Section 20 + User
  schemas/      Pydantic request/response models
  services/
    scoring.py           pure functions: susceptibility, hazard, fusion,
                          confidence, forecast -- no DB/IO, fully unit-tested
    risk_service.py       loads DB state, calls scoring.py, persists results
    weather_ingestion.py  real Open-Meteo client (IMD client stubbed, pending
                          government API approval)
    exposure.py            PostGIS spatial joins: infra/roads near risk cells
    response_priority.py   Section 9 priority formula
    alert_engine.py         Section 8 levels + Section 15 role-specific messages
    simulation.py           Section 12 what-if rainfall scenarios
  routers/       one file per Section 21 API group
scripts/
  seed_demo.py   creates one risk cell, feeds it light then heavy rainfall,
                 prints the risk number changing -- the Week-1 vertical slice,
                 runnable directly
tests/
  test_scoring.py   11 unit tests against the pure scoring functions
                     (already run and passing -- see "What's been tested" below)
```

## What's been tested vs. what needs a real Postgres

**Tested in this build environment (no live DB needed):**
- `app/services/scoring.py` -- 11 unit tests, all passing, including a real
  bug caught and fixed (the forecast trajectory was non-monotonic under an
  escalating-rainfall scenario; fixed by decoupling the "is rain trending
  worse" signal from the per-horizon interpolation).
- The entire FastAPI app imports cleanly -- every router, schema, service,
  and model wired together correctly (`from app.main import app` succeeds
  and all 16 documented endpoints register).
- All 9 ORM models register correctly on `Base.metadata`.

**Not integration-tested here (needs a real PostGIS instance, which this
sandbox can't run):** the actual spatial SQL in `exposure.py` and
`reports.py` (`ST_DWithin`, `ST_Distance`). The queries are written
correctly per GeoAlchemy2's documented API, but you should run
`scripts/seed_demo.py` plus a couple of infrastructure/road rows locally
and sanity-check `/infrastructure/at-risk` and `/roads/at-risk` before
depending on them for a live demo. `ST_DWithin` here also uses a rough
degrees-to-meters approximation (`DEFAULT_EXPOSURE_RADIUS_DEGREES`); swap to
a `geography` cast for accurate meter-based radii before Friday's demo if
exposure distances matter to the story you're telling.

## Setup

```bash
cp .env.example .env          # edit JWT_SECRET_KEY at minimum
docker compose up -d db redis
pip install -r requirements.txt
uvicorn app.main:app --reload  # creates tables on startup (dev convenience;
                                # swap to Alembic before this touches a shared DB)
```

Run the vertical-slice demo:

```bash
PYTHONPATH=. python scripts/seed_demo.py
```

Expected output: one risk cell, scored once under light rainfall and again
under heavy escalating rainfall, with the risk_score/level visibly moving
between the two runs -- the actual Week-1 exit condition.

Run tests:

```bash
pip install pytest
PYTHONPATH=. pytest tests/ -v
```

API docs (once running): `http://localhost:8000/docs`

## Auth

Simple JWT bearer auth with three roles (`authority`, `field`, `citizen`),
matching Section 26's RBAC requirement. `POST /auth/register` then
`POST /auth/login` (OAuth2 password flow -- send `username`=email,
`password`). Citizen report submission works anonymously
(`get_optional_user`) since field/citizen users may not always be
authenticated, matching Section 13's citizen-app workflow.

## What's deliberately NOT here (Phase 2, per Section 29)

- InSAR/Sentinel-1 deformation ingestion
- Optical satellite change detection (Sentinel-2)
- Computer-vision classification of citizen photos
- Advanced route optimization
- AI disaster assistant
- Alembic migrations (using `create_all` for MVP dev speed -- set up Alembic
  before this schema needs to evolve safely against real data)
- Redis caching is wired into `docker-compose.yml` and `settings.REDIS_URL`
  but not yet used by any endpoint -- add it to `/risk/zones` first if list
  queries get slow with a full NER grid loaded.
- Rate limiting on public reporting endpoints (Section 26 flags this -- add
  before any public citizen-facing deployment)

## Notes for your team's module owners

- **Member 1 (AI/ML)**: your integration point is `app/services/scoring.py`.
  Keep the function signatures (`score_susceptibility`, `score_dynamic_hazard`)
  and swap the internals for real model inference once you have a trained,
  validated model. Register it as a new `ModelVersion` row with
  `deployment_status=TRAINED` and real `metrics`.
- **Member 2 (GIS/Satellite)**: `RiskCell`'s static fields
  (`slope_degrees`, `land_cover_class`, etc.) are what your terrain
  pipeline should populate. InSAR/optical evidence has a `ModelType` slot
  reserved but no ingestion pipeline yet -- that's your Phase 2 build.
- **Member 3 (Data pipeline)**: `weather_ingestion.py` is the seam for
  swapping Open-Meteo for IMD once API access clears -- implement
  `IMDClient.fetch()` matching the same return shape as
  `OpenMeteoClient.fetch()`.
- **Member 5 (Frontend)**: `/risk/zones`, `/risk/explanation/{id}`,
  `/risk/forecast/{id}`, `/dashboard/summary` are your main map/dashboard
  data sources. `/simulation/rainfall-scenario` powers the what-if slider.
- **Member 6 (Mobile/Offline)**: `POST /reports` and `POST /reports/sync`
  are built for exactly the offline queue -> reconnect -> batch upload flow
  in Section 14. Idempotency is keyed on `client_report_id`, generated
  on-device -- generate that before the report ever hits local storage, and
  retries are automatically safe.
