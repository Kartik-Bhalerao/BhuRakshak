# 🏔️ BhuRakshak (Bhu-Rakshak) — AI-Based Logistics Accessibility & Disaster Intelligence Platform

**Smart India Hackathon (SIH) 2026 Project (PS ID: SIH26002)**  
**Target Region:** North Eastern Region (NER) of India  
**GitHub Repository:** https://github.com/Kartik-Bhalerao/BhuRakshak

---

## 📌 Project Overview

The North Eastern Region (NER) faces severe logistics and accessibility challenges due to difficult terrain, extreme weather conditions, limited transport connectivity, and frequent disruptions caused by landslides, floods, and heavy rainfall. The transportation of essential goods (such as medicines, food supplies, and construction materials) to remote districts often suffers from major delays, causing supply shortages and economic setbacks.

BhuRakshak is an operational risk-corridor and supply-chain continuity platform designed to monitor transportation networks, execute deterministic risk fusion, track essential commodity transport, and maintain logistics flow across high-risk NER corridors. Instead of relying on speculative, unprovable real-time micro-predictions, BhuRakshak cross-references static Geological Survey of India (GSI) high-risk prone zones with live India Meteorological Department (IMD) heavy rainfall telemetry to proactively lock down dangerous routes and calculate safe alternative pathways.

---

## 🎯 Key Features & Requirements Addressed

- **🗺️ GIS-Enabled Accessibility Monitoring Dashboard:** Centralized real-time visualization of district-wise connectivity status, logistics bottlenecks, emergency routes, and essential supply delivery tracking.
- **🔄 Deterministic Risk Fusion Engine:** JavaScript-based spatial logic that cross-references live IMD rainfall alerts against GSI prone-zone geometries to evaluate active hazard corridors.
- **🔄 Smart Rerouting & Delay Estimation:** Instantly calculates safe alternate routes and estimated travel times to ensure continuous movement of goods.
- **📍 Fleet & Cargo Monitoring:** Tracks the movement of transport vehicles carrying essential commodities, agricultural produce, and medical supplies along vulnerable routes.
- **📱 Offline-First Field Officer Incident Logging:** Allows ground officials and transport dispatchers to upload geo-tagged incident reports, photographs, and road status updates from remote mountain zones without constant internet access.
- **🔄 Automated SQLite Sync Queue:** Field logs and GPS telemetry captured offline are written directly to an on-device SQLite transactional queue (`sync_queue`) and automatically synchronized with the FastAPI central server once connectivity is restored.
- **🚨 Multi-Channel Alert Dispatcher:** Automated generation and multilingual distribution of emergency alerts for blocked roads, high-risk transport corridors, and delayed deliveries.

---

## 🏗️ System Architecture & Repository Structure

```text
BhuRakshak/
├── mobile/            # Flutter / React Native Mobile App (Offline CFR & Field Alerts)
├── backend/           # FastAPI REST API, Database Connectors, & Sync Handlers
├── risk-fusion/       # JavaScript (Turf.js / Node.js) Spatial Risk Fusion Engine
├── data-pipeline/     # Live Weather APIs (IMD) & GSI Spatial Data Ingestion
├── gis/               # PostGIS Spatial Database Schemas & Routing Layers
├── docs/              # System Architecture & API Contract Blueprints
└── infrastructure/    # Deployment, Docker, & Cloud Configuration
