# Database Schema Documentation

## 1. Local Mobile Storage (SQLite - Client Side)
Used by the mobile application to store citizen and field officer reports locally when device is offline.

### Table: `pending_reports`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Local report ID |
| `latitude` | REAL | NOT NULL | GPS latitude coordinate |
| `longitude` | REAL | NOT NULL | GPS longitude coordinate |
| `severity` | TEXT | NOT NULL | `LOW`, `MODERATE`, `HIGH`, `CRITICAL` |
| `description` | TEXT | NULLABLE | Details or notes observed |
| `image_uri` | TEXT | NULLABLE | Local file path to stored photo |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Local timestamp when captured |
| `synced` | INTEGER | DEFAULT 0 | Sync status flag (`0` = Pending, `1` = Synced) |

---

## 2. Server Storage (PostgreSQL / PostGIS - Backend Side)
Used by the main system backend to record verified field reports across the region.

### Table: `citizen_reports`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `report_id` | UUID | PRIMARY KEY | Unique identifier for report |
| `location` | GEOMETRY(Point, 4326) | NOT NULL | PostGIS geospatial point |
| `severity` | VARCHAR(20) | NOT NULL | Hazard severity rating |
| `description` | TEXT | NULLABLE | Report description |
| `media_url` | TEXT | NULLABLE | Remote URL to stored cloud image |
| `status` | VARCHAR(20) | DEFAULT 'NEW' | `NEW`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Server timestamp upon ingestion |