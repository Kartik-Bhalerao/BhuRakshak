# API Contract Documentation

## Citizen & Field Reporting (CFR) Sync Endpoint

### POST `/api/v1/reports/sync`
Uploads saved offline citizen/field reports to the backend server once network connectivity is restored.

#### Request Headers
- `Content-Type`: `multipart/form-data`

#### Multipart Form Parameters
| Key | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `latitude` | Float | Yes | GPS Latitude | `26.1445` |
| `longitude` | Float | Yes | GPS Longitude | `91.7362` |
| `severity` | String | Yes | Risk severity level | `"HIGH"` |
| `description` | String | No | Observation notes | `"Deep crack formed across road."` |
| `file` | File (Binary) | No | JPEG/PNG photo attachment | `report_12.jpg` |

#### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Report synced successfully",
  "report_id": "c39a82e1-7d1a-42f1-9031-158229b4b45a",
  "verification_status": "NEW"
}

{
  "status": "error",
  "message": "Invalid latitude or longitude format"
}

{
  "status": "error",
  "message": "Failed to store report media attachment"
}