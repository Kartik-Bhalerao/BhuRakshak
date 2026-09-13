# BhuRakshak — Authority Command Centre (MVP)

A landslide risk monitoring dashboard for Northeast India (NER), built as a frontend-only MVP. The application provides an interactive risk map, KPI overview, zone-level risk assessment, forecast timeline, exposure analysis, and response prioritization.

## Stack

- **React 18 + TypeScript**
- **Vite** (dev server + build)
- **Tailwind CSS** (styling)
- **MapLibre GL JS** (interactive map)
- **React Router** (page routing)
- **Lucide React** (icons)

No backend, no database, no authentication, no API keys required.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## MVP Pages

| Route | Status | Description |
|-------|--------|-------------|
| `/dashboard` | Complete | KPI cards, risk map, selected-zone panels, response priority |
| `/risk-map` | Complete | Full-screen risk map with all detail panels |
| `/alerts` | Lightweight | Alert list with acknowledge |
| `/reports` | Placeholder | Reserved for situation reports |
| `/analytics` | Placeholder | Reserved for trend analysis |
| `/simulation` | Placeholder | Reserved for rainfall what-if |
| `/settings` | Placeholder | Reserved for configuration |

## Architecture

```
src/
├── components/
│   ├── layout/     Sidebar, Header, AppShell
│   ├── common/     Panel, RiskBadge, KpiCard
│   ├── dashboard/  KpiRow
│   ├── map/        RiskMap, MapLegend, LayerControls
│   ├── risk/       RiskScorePanel, ForecastTimeline, RiskExplanation
│   ├── impact/     ExposurePanel
│   ├── response/   ResponsePriority
│   └── alerts/     AlertCard, AlertList
├── pages/          Dashboard, RiskMap, Alerts, Reports, Analytics, Simulation, Settings
├── services/       api.ts, risk.ts, weather.ts, reports.ts, alerts.ts, simulation.ts
├── types/          risk.ts (all shared types)
├── data/           Mock GeoJSON + typed mock data
├── utils/          riskColors.ts, formatters.ts, mapConfig.ts
├── App.tsx         Router
└── main.tsx        Entry point
```

### Data Flow

1. Pages call service modules (`services/risk.ts`, etc.)
2. Services return typed mock data (simulated latency)
3. UI components receive data via props — no global state library
4. `selectedZoneId` is local React state in each page, passed to map + panels via props

### Service Layer

UI components never import mock data directly. All data flows through typed service modules. When a real backend is available, only the service files change — component code stays the same.

### Map Configuration

Map provider settings are isolated in `src/utils/mapConfig.ts`. The map uses free OpenStreetMap raster tiles (no API key). To change providers, edit only that file.

The map remains functional even if base-map tiles fail to load — GeoJSON risk overlays render independently on top of the map container.

## Demo Data Disclaimer

All data in this MVP is **simulated**. Risk scores are shown as `0–100` indices, not probabilities. Every panel and card carries a "SIMULATED" label. No real sensors, satellites, or APIs are connected.
