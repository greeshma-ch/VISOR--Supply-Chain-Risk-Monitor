# 🛰️ VISOR - AI-Native Supply Chain Resilience Copilot

VISOR is an AI-powered supply chain resilience platform for monitoring disruption risks, simulating critical scenarios, and supporting proactive mitigation decisions using live signals and Gemini-powered reasoning.


## Live Demo
https://visor-934259760793.us-west1.run.app/


---

## Overview

VISOR helps move supply chain operations from reactive monitoring toward predictive resilience by combining:

- Real-time disruption signals  
- AI-driven risk analysis  
- Node-level crisis simulation  
- Mitigation recommendations  
- Supply network visibility

The system monitors potential disruptions such as weather events, port congestion, strikes, and operational anomalies, then generates contextual intelligence to support decision-making.

---

## Features

### Predictive Risk Intelligence
- Dynamic disruption risk detection  
- Severity classification  
- Context-aware AI risk analysis

### Real-Time Signal Monitoring
- Weather monitoring via OpenWeather  
- Port congestion and event signals  
- Historical risk context

### Node Briefings
- Live risk intelligence per supply node  
- Stability assessments  
- Alternate node recommendations  
- Mitigation planning

### Crisis Simulation Mode
- Node-level what-if disruption scenarios  
- Cascading impact analysis  
- Stress testing under critical conditions

### Dashboard & Visualization
- Executive intelligence dashboard  
- Supply node map visualization  
- Risk signals and operational alerts

---

## Architecture

VISOR consists of:

- **Frontend Interface**  
Dashboard, node briefings, crisis simulation, Map visualization, Resources and Authentication views

- **Signal Layer**  
Weather feeds, disruption signals, historical archives

- **Intelligence Layer**  
Gemini-powered reasoning and risk analysis

- **Decision Layer**  
Severity classification, mitigation recommendations, crisis simulation

- **Deployment Layer**  
Google Cloud Run

---

## Tech Stack

### AI / Intelligence
- Google Gemini API  
- Prompt-driven reasoning

### APIs
- OpenWeather API  
- Google Maps API

### Development
- Google AI Studio (Build Mode)

### Deployment
- Google Cloud Run

---

## Getting Started

### Prerequisites
- Node.js

Install dependencies

```bash
npm install
```

Configure environment variables in `.env.local`

```env
GEMINI_API_KEY=
OPENWEATHER_API_KEY=
GOOGLE_MAPS_API_KEY=
```

Run locally

```bash
npm run dev
```

---

## Deployment
Deploy using Google Cloud Run.

---

## Future Enhancements
- Sector-specific adaptive dashboards  
- Mitigation optimization  
- Supplier dependency graph modeling  
- Adaptive resilience scoring  
- Inventory impact estimation  
- Automated alert escalation workflows

---

# 🧠 How It Works

```text
Authentication
   ↓
Supply Node Monitoring
   ↓
Real-Time Signals
(Weather + Events + Archives)
   ↓
Gemini Risk Reasoning
   ↓
Severity Classification
   ↓
Mitigation Recommendations
   ↓
Decision Support Dashboard
   ↓
(Optional)
Node Crisis Simulation
```

---
## Screenshots

<div align="center">

### Authentication View

   <img width="699" height="935" alt="Screenshot 2026-04-28 234319" src="https://github.com/user-attachments/assets/e2a7fb94-3f14-4218-a32b-6f33bb25ad29" />
<br><br>

### Dashboard View

 <img width="48%" alt="Screenshot 2026-04-28 234334" src="https://github.com/user-attachments/assets/e9cbad01-864e-4c6d-a391-a5542b5ac6dc" />

  &nbsp;
  <img width="48%" alt="Screenshot 2026-04-28 234359" src="https://github.com/user-attachments/assets/ba969a20-df72-49d0-b253-fbd594a6036c" />
  
<br><br>

###Node Analysis and Crisis Mode

 <img width="48%" alt="Screenshot 2026-04-28 234417" src="https://github.com/user-attachments/assets/16d59f5a-b039-429d-89c9-19ebe14e75ed" />

  &nbsp;
  <img width="48%" alt="Screenshot 2026-04-28 234442" src="https://github.com/user-attachments/assets/b66b9757-bb0e-4ed7-b196-5eda61e36233" />

<br><br>

### Map Visualization

<img width="1902" height="972" alt="Screenshot 2026-04-28 234456" src="https://github.com/user-attachments/assets/bd8c69e7-69f8-44ac-aefd-28bcbd0aca47" />


</div>
---


## Vision
Build intelligent tools that help supply chains become more resilient, adaptive and proactive under disruption.

---
