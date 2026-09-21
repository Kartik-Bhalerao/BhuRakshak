# 🏔️ BhuRakshak (Bhu-Rakshak) — AI-Based Landslide Early Warning & Disaster Reporting Platform

> **Smart India Hackathon (SIH) 2026 Project**  
> *Target Region: North Eastern Region (NER) of India*

BhuRakshak is an integrated, offline-first landslide monitoring, early warning, and field reporting platform designed specifically for high-risk terrains in North East India. It bridges the critical gap between predictive AI hazard models and real-time field operations during severe weather events.

---

## 📌 Core Features

* **📱 Offline-First Citizen & Field Reporting (CFR):** Allows citizens and field officers to report hazards (ground cracks, mudslides, rockfalls) with auto-GPS tagging and media attachments, even without internet access.
* **🔄 Automated SQLite Sync Queue:** Transactions are queued locally on the mobile device and automatically synced to the primary server once connectivity is restored.
* **🚨 Multi-Channel Alert Dispatcher:** Delivers localized, multi-lingual emergency push notifications and SMS warnings to citizens and field responders.
* **🤖 AI/ML Hazard Prediction:** Integrates rainfall, PostGIS spatial data, and terrain analytics to estimate landslide risk indices in real time.
* **🗺️ GIS Mapping & Spatial Analytics:** Interactive map layers displaying active hazard zones and field report clusters.

---

## 🏗️ Repository Architecture

```text
BhuRakshak/
├── mobile/            # React Native / Expo Mobile App (CFR & Alerts)
├── backend/           # FastAPI REST API & Database Connectors
├── ml/                # AI Landslide Risk Prediction Models
├── data-pipeline/     # Live Weather & Spatial Data Ingestion Pipeline
├── gis/               # PostGIS Spatial Database Schemas & Layers
├── docs/              # System Architecture & API Contract Blueprints
└── infrastructure/    # Deployment & Docker Configuration
