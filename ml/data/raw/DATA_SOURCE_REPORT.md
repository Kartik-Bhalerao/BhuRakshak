# BhuRakshak Data-Source Report

## Current result

The final assembled dataset contains **702 rows**: 351 reported positive events and 351 deterministic background samples. Rainfall and soil-wetness values were obtained for all rows. Copernicus terrain values were obtained for 656 rows; 46 terrain triplets remain missing because the public GLO-30 tile/window was unavailable. The dataset is therefore **NOT READY FOR XGBOOST** until the missing terrain rows and the soil-feature choice are resolved.

## Sources actually used

| Feature | Source and version | Resolution and units | Alignment and processing | Result |
|---|---|---|---|---|
| Rainfall | NASA POWER hourly `PRECTOTCORR`, MERRA-2 source | Hourly; precipitation in mm/hour | Values strictly before T were summed over the preceding 1 hour, 24 hours, and 7 days. UTC was requested. Date-only records use 00:00 UTC at the start of the source date, so event-day future information is excluded. | 702/702 complete |
| Elevation | Copernicus DEM GLO-30 Public, 2021 release, public AWS COG | Approximately 30 m; elevation in metres | Remote COG sampled at the event/background coordinate. Public bucket tile naming uses the 1 arc-second `COG_10` path. | 656/702 complete |
| Slope and aspect | Derived from the same Copernicus DEM window | Slope in degrees; aspect in degrees clockwise from north, 0–360 | Horn 3×3 finite differences with local metre conversion from the DEM’s geographic resolution. Flat cells are recorded as aspect 0. | 656/702 complete |
| Soil feature | NASA POWER daily `GWETTOP`, MERRA-2 source | Daily; dimensionless surface-soil-wetness index, nominal range 0–1 | Previous UTC date was used for every row to avoid same-day post-event leakage. This is **not SMAP volumetric soil moisture** and must be treated as a proxy. | 702/702 complete |
| Positive events | NASA Global Landslide Catalog export | Event inventory | Normalized state names and retained only the eight NER states. | 351/351 complete |
| Background locations | GADM v4.1 India ADM1 boundaries | State polygons | One deterministic point per positive, inside the same NER state, at least 20 km from every known positive and at least 5 km from other backgrounds. Calendar dates were matched to positive observations. | 351/351 constructed |

## Official URLs

- NASA GLC: https://data.nasa.gov/dataset/global-landslide-catalog-export
- NASA GLC CSV: https://data.nasa.gov/docs/legacy/Global_Landslide_Catalog_Export/Global_Landslide_Catalog_Export_rows.csv
- NASA POWER hourly API: https://power.larc.nasa.gov/docs/services/api/temporal/hourly/
- NASA POWER daily API: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- Copernicus DEM product: https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM
- Copernicus public AWS registry: https://registry.opendata.aws/copernicus-dem/
- GADM boundary source: https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_IND_1.json
- SMAP product investigated but not used: https://nsidc.org/data/spl3smap/versions/3
- IMERG product investigated but not used: https://registry.opendata.aws/nasa-gpm3imerghh/

## Background-sample assumptions

A background row means that a deterministic observation point was selected inside the same administrative state and outside a 20 km radius of every known positive event. It does **not** mean that no landslide occurred there. Background dates were matched to positive event dates to preserve broad temporal seasonality. The samples remain subject to inventory under-reporting and spatial sampling bias.

## Important limitations

NASA POWER is a reanalysis/assimilation product, not IMERG satellite precipitation. It is a credible public fallback, but the source should be stated explicitly in any model paper. The POWER `GWETTOP` variable is surface soil wetness, not SMAP’s volumetric soil-moisture retrieval. Copernicus GLO-30 is a DSM and can include vegetation and infrastructure. Public GLO-30 coverage is limited; 45 background samples and one positive lacked a usable 3×3 DEM window. These rows must not be silently imputed or dropped.

## References

[1]: https://data.nasa.gov/dataset/global-landslide-catalog-export "NASA Global Landslide Catalog Export"
[2]: https://power.larc.nasa.gov/docs/services/api/temporal/hourly/ "NASA POWER Hourly API"
[3]: https://power.larc.nasa.gov/docs/services/api/temporal/daily/ "NASA POWER Daily API"
[4]: https://registry.opendata.aws/copernicus-dem/ "Copernicus DEM public AWS registry"
[5]: https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM "Copernicus DEM product description"
[6]: https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_IND_1.json "GADM India ADM1 boundary file"
[7]: https://nsidc.org/data/spl3smap/versions/3 "NASA SMAP L3 product investigated as primary soil source"
[8]: https://registry.opendata.aws/nasa-gpm3imerghh/ "NASA GPM IMERG Final Run product investigated as primary rainfall source"
