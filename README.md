# 🏔️ BhuRakshak (Bhu-Rakshak) — AI-Based Logistics Accessibility & Disaster Intelligence Platform

**Smart India Hackathon (SIH) 2026 Project**  
**Target Region:** North Eastern Region (NER) of India  
**GitHub Repository:** [https://github.com/Kartik-Bhalerao/BhuRakshak](https://github.com/Kartik-Bhalerao/BhuRakshak)

---

## 📌 Project Overview

The North Eastern Region (NER) faces severe logistics and accessibility challenges due to difficult terrain, extreme weather conditions, limited transport connectivity, and frequent disruptions caused by landslides, floods, and heavy rainfall. The transportation of essential goods (such as medicines, food supplies, and construction materials) to remote districts often suffers from major delays, causing supply shortages and economic setbacks.

**BhuRakshak** is an AI-powered, offline-first logistics intelligence and disaster reporting platform designed to monitor transportation networks, predict weather-induced route disruptions, track essential commodity transport, and optimize supply chain movement across high-risk NER corridors.

---

## 🎯 Key Features & Requirements Addressed

- **🗺️ GIS-Enabled Accessibility Monitoring Dashboard:** Centralized real-time visualization of district-wise connectivity status, logistics bottlenecks, emergency routes, and essential supply delivery tracking.
- **🤖 AI-Powered Disruption Prediction:** Integrates rainfall data, PostGIS spatial parameters, and terrain analytics to predict route blockages *before* they paralyze supply chains.
- **🔄 Smart Rerouting & Delay Estimation:** Instantly calculates safe alternate routes and estimated travel times to ensure continuous movement of goods.
- **📍 GPS Vehicle Tracking:** Monitors the movement of transport vehicles carrying essential commodities, agricultural produce, and medical supplies.
- **📱 Offline-First Citizen & Field Reporting (CFR):** Allows field officials and local authorities to upload geo-tagged incident reports, photographs, and road status updates from remote mountain zones without constant internet access.
- **🔄 Automated SQLite Sync Queue:** Transactions and reports are cached locally on mobile devices and automatically synchronized with the central server once connectivity is restored.
- **🚨 Multi-Channel Alert Dispatcher:** Automated generation and multilingual distribution of emergency alerts for blocked roads, high-risk transport corridors, and delayed deliveries.

---

## 🏗️ System Architecture & Repository Structure

```text
BhuRakshak/
├── mobile/            # React Native / Expo Mobile App (Offline CFR & Field Alerts)
├── backend/           # FastAPI REST API, Database Connectors, & Sync Handlers
├── ml/                # AI/ML Landslide & Route Risk Prediction Models
├── data-pipeline/     # Live Weather APIs & Spatial Data Ingestion Pipeline
├── gis/               # PostGIS Spatial Database Schemas & Routing Layers
├── docs/              # System Architecture & API Contract Blueprints
└── infrastructure/    # Deployment, Docker, & Cloud Configuration
