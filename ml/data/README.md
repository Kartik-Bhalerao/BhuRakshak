# Data

`raw/bhuRakshak_final_ml_dataset.csv` — the real ML dataset produced by the separate data-engineering
process (702 rows: 351 reported NASA GLC landslide events + 351 controlled background samples).
Companion files from that process: `DATA_DICTIONARY.md`, `DATA_SOURCE_REPORT.md`, `quality_report.json`.
Nothing in this module modifies, imputes, or synthesizes data. The 46 rows with missing terrain stay NaN.

Read the label and feature caveats in `../README.md` ("Data" and "Limitations") before using this data:
label 0 is a *background sample, not confirmed absence*; `soil_moisture` is a MERRA-2 GWETTOP proxy, *not SMAP*;
rainfall is NASA POWER / MERRA-2 reanalysis, *not IMERG*.
