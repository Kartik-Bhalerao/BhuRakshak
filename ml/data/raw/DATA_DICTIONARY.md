# BhuRakshak Data Dictionary

| Field | Meaning | Unit | Source | Processing and alignment |
|---|---|---|---|---|
| `event_id` | Unique event or background identifier | Identifier | NASA GLC or construction rule | Positive IDs preserved; background IDs are deterministic `background_####`. |
| `latitude` | Sample latitude | Decimal degrees, WGS84 | NASA GLC or GADM-constrained construction | Validated range -90 to 90. |
| `longitude` | Sample longitude | Decimal degrees, WGS84 | NASA GLC or GADM-constrained construction | Validated range -180 to 180. |
| `timestamp` | Event/observation timestamp | UTC representation | NASA GLC or matched positive date | No event date was invented. Background dates match positive observation dates. |
| `state` | NER state | Text | NASA GLC or GADM | Restricted to the eight NER states. |
| `rainfall_1h` | Preceding one-hour precipitation | mm | NASA POWER `PRECTOTCORR`, MERRA-2 | Hourly values strictly before T summed over one hour. Complete for 702 rows. |
| `rainfall_24h` | Preceding 24-hour precipitation | mm | NASA POWER `PRECTOTCORR`, MERRA-2 | Hourly values strictly before T summed over 24 hours. Complete for 702 rows. |
| `rainfall_7d` | Preceding seven-day precipitation | mm | NASA POWER `PRECTOTCORR`, MERRA-2 | Hourly values strictly before T summed over seven days. Complete for 702 rows. |
| `elevation` | DEM surface elevation | metres | Copernicus DEM GLO-30 Public, 2021 release | Remote COG sampled at coordinate. 656 complete; 46 unavailable. |
| `slope` | Terrain slope from DEM | degrees | Derived from Copernicus DEM GLO-30 | Horn 3×3 finite differences with local metre conversion. 656 complete. |
| `aspect` | Terrain aspect from DEM | degrees, 0–360 clockwise from north | Derived from Copernicus DEM GLO-30 | Same 3×3 window; flat cells recorded as 0. 656 complete. |
| `soil_moisture` | Surface soil-wetness proxy | Dimensionless index, nominal 0–1 | NASA POWER `GWETTOP`, MERRA-2 | Previous UTC daily value used to avoid same-day future leakage. Complete for 702 rows. This is not SMAP volumetric moisture. |
| `landslide_occurrence` | Binary target | 0/1 | Construction rule | `1` reported GLC event; `0` controlled background sample, not confirmed absence. |
| `sample_type` | Row provenance | Text | Construction rule | `confirmed_reported_event` or `background_sample`. |
| `source_event_date_precision` | Time precision | Text | NASA GLC/construction rule | Distinguishes source event time from date-only or matched background date. |

## Background-sample metadata

The source file `processed/background_samples.csv` retains the state, matched timestamp, minimum distance from known positives, and the selection rationale. Each background point is at least 20 km from every known positive and at least 5 km from other selected background points. These controls reduce direct spatial contamination but do not establish confirmed absence.
