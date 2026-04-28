# 🛰️ VISOR — AI-Native Supply Chain Risk Monitoring System

VISOR is an AI-powered supply chain risk monitoring application that analyzes real-time external signals and uses LLM-driven reasoning to proactively detect disruption risks, generate contextual alerts, and support faster operational decisions.

🌐 **Live Demo:** https://visor-934259760793.us-west1.run.app

---

## 🧠 What this project does

VISOR monitors potential supply chain disruptions by combining live external signals (such as weather and risk indicators) with AI-powered analysis.

Instead of reactive tracking, the system focuses on **proactive risk detection**, helping identify vulnerabilities before disruptions escalate.

---

## 📌 Features

### 🤖 AI Risk Intelligence

* LLM-powered disruption risk analysis
* Contextual risk scoring and alert generation
* Dynamic supply chain vulnerability detection

### 🌐 Real-Time Signal Monitoring

* Weather signal integration using OpenWeather APIs
* Live external data feed ingestion
* Real-time risk-triggered monitoring workflows

### 💻 Application Experience

* Interactive AI-native monitoring interface
* Live risk dashboards and alerts
* Responsive workflow for continuous monitoring
* Publicly deployed live application

---

## ⚙️ How it works

```text
User Inputs / Supply Signals
        │
        ▼
External Data APIs (Weather + Live Feeds)
        │
        ▼
Google Gemini Analysis Engine
        │
        ▼
Risk Scoring + Dynamic Alerts
        │
        ▼
Monitoring Interface
```

Workflow:

* External signals are continuously monitored
* Data is analyzed using Google Gemini
* Risk scores and disruption alerts are generated
* Results are surfaced through the monitoring interface in real time

---

## 🚀 Tech Stack

**AI / Intelligence**

* Google Gemini API
* Prompt-driven risk analysis
* LLM-based reasoning

**Data Sources**

* Gemini API
* OpenWeather API
* Live external signal feeds

**Development**

* Google AI Studio (Build Mode)

**Deployment**

* Google Cloud Run

---

## 📊 Core Capabilities

* Proactive disruption risk detection
* Context-aware alerting
* Real-time monitoring workflows
* AI-assisted decision support

---

## 🧩 Focus Areas

Some areas emphasized while building VISOR:

* AI-native product design
* Real-time signal integration
* Explainable risk scoring
* Intelligent workflow automation
* Deploying an LLM-powered monitoring application

---

## 🚀 How to Run

**Prerequisites:**  Node.js

1. Clone the repo

```bash
git clone https://github.com/greeshma-ch/visor.git
cd visor
```

2. Install dependencies

```bash
npm install
```

3. Set environment variables in [.env.local](.env.local) 

```env
GEMINI_API_KEY=
OPENWEATHER_API_KEY=
```

4. Run locally

```bash
npm run dev
```

5. Deploy using Google Cloud Run.

---

## 🔮 Future Improvements

* Advanced analytics dashboards
* Multi-agent autonomous monitoring workflows

---
<div align="center">
<img width="900" height="575" alt="dashboard" src="https://github.com/user-attachments/assets/03732f93-b84d-42d9-bf60-b8e508223ac8" />
   <br><br>
<img width="900" height="575" alt="Map Anlaytics" src="https://github.com/user-attachments/assets/a5d174da-4dbe-43f3-9f4d-f67c130776dd" />
     <br><br>
<img width="900" height="575" alt="Risk Intelligence Briefing" src="https://github.com/user-attachments/assets/8286b481-6d16-4ff2-9f3d-78023dad775e" />
</div>
