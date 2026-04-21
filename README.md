
🚀 VISOR – AI Supply Chain Risk Monitor

VISOR is a high-fidelity logistics monitoring dashboard designed to identify, categorize, and mitigate supplier risks in real time.
By integrating live weather and news data with LLM-driven analysis, VISOR replaces static spreadsheets with dynamic, data-driven decision-making.

🌐 Live Application

🔗 https://visor-934259760793.us-west1.run.app

----
## ✨ Key Features
* Automated Risk Categorization
* Uses real-time news and weather signals analyzed via LLMs to classify suppliers into Stable, Caution, or Risky states.
* Geospatial Intelligence
* Interactive map visualization of supplier locations with live weather overlays and alerts.
* AI-Powered Decision Engine
* Leverages Gemini 3 Flash to autonomously assess supplier stability and contextual risk.
* Cloud-Native Architecture
* Fully containerized and deployed on Cloud Run for scalable, low-latency access.
* Production-Ready Security
* Implements API key management, spend caps, and secure environment configurations.

---
## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS (Modern/Grunge UI)

### Backend

* Node.js (Express 5)
* TypeScript

### AI/ML

* Gemini 3 Flash (via Google AI Studio)

### Cloud & Infrastructure

* Google Cloud Run (Containerized deployment)
* Google AlloyDB (PostgreSQL-compatible database)

## APIs & Integrations

* OpenWeather API
* NewsAPI
* Google Maps JavaScript API

---  
## 🏗️ Architecture Overview
### VISOR follows a cloud-native, event-driven architecture:

* External APIs (weather + news) provide real-time signals
* Backend processes and structures incoming data
* LLM (Gemini) performs contextual risk analysis
* Results are stored and served via scalable cloud infrastructure
* Frontend dashboard visualizes risks and alerts in real time

---
## ⚙️ Local Setup
1. Clone the Repository
```bash
git clone https://github.com/your-username/VISOR.git
cd VISOR
```
2. Install Dependencies
```bash
npm install
```
3. Configure Environment Variables

#### Create a .env file in the root directory:
```bash
GEMINI_API_KEY=your_key_here
VITE_GOOGLE_MAPS_API_KEY=your_key_here
PORT=8080
```
4. Run the Development Server
```bash
npm run dev
```
---
## 🚀 Deployment

VISOR is deployed using Google Cloud Run with a containerized setup.

To deploy a new revision:
```bash
gcloud run deploy visor --source . --region us-west1
```
---


## 📌 Project Context

This project was developed as a capstone submission for the BUILD the Future Showcase under Startup School (Google initiative), focusing on rapid prototyping of AI-powered applications.

---
## 📸 Application Preview

<div align="center">
![VISOR Dashboard]<img width="1919" height="1056" alt="dashboard" src="https://github.com/user-attachments/assets/8adf969b-7366-4a25-bbe1-374ba79ebd0c" />

![Risk Analysis view]<img width="1920" height="1200" alt="Risk Intelligence Briefing" src="https://github.com/user-attachments/assets/95b5c8aa-1a86-4ade-b9bb-400b9f7c9414" />

![Map Analytics]<img width="1920" height="1128" alt="Map Anlaytics" src="https://github.com/user-attachments/assets/4ecd94c9-271d-473a-bf02-64de6677fdf5" />

</div>

----
## 🧠 Key Takeaways
* Built an end-to-end AI system combining LLMs, real-time data, and cloud infrastructure
* Designed for scalability, interpretability, and real-world applicability
* Demonstrates strong understanding of full-stack + cloud + AI integration
---
