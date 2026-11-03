# UdyamSaarthi 🚀
> **"Your Path to the Right Government Scheme"**

[![SIH26092](https://img.shields.io/badge/SIH-26092-blue.svg)](https://sih.gov.in)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_v0.100+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_v18+-61DAFB.svg)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg)](https://python.org)

**UdyamSaarthi** is an official AI-driven scheme matching and channel partner locator platform built for the **Smart India Hackathon (SIH 2026)** under Problem Statement **SIH26092** (Ministry of Social Justice and Empowerment - MoSJE / National Scheduled Castes Finance and Development Corporation - NSFDC).

---

## 🏗️ Full-Stack Architecture

UdyamSaarthi converts client-side prototype logic into a production-grade full-stack architecture:

```
                                  UdyamSaarthi Architecture
                                  
       ┌──────────────────────────────────────────────────────────────┐
       │                   React + Vite Frontend                      │
       │  - Modern Government UI (Tailwind CSS + Lucide Icons)        │
       │  - Interactive Pages: Home, Check Eligibility, My             │
       │    Recommendations, EMI Calculator, Partner Locator, AI      │
       │  - I18n Engine (English & Hindi)                             │
       │  - Searchable 36 State/UT + District Cascading Dropdowns     │
       └──────────────────────────────┬───────────────────────────────┘
                                      │ REST API (JSON)
                                      ▼
       ┌──────────────────────────────────────────────────────────────┐
       │                    Python FastAPI Backend                    │
       │  - Modular Endpoints (/api/schemes, /api/recommend, etc.)    │
       │  - Core Services:                                            │
       │    1. Recommendation Engine (Stage 1 Filter + Stage 2 Rank)  │
       │    2. Explainability Engine ("WHY THIS SCHEME?")             │
       │    3. EMI Calculator Service (Moratorium & Schedule Math)    │
       │    4. Geospatial Partner Locator (City-level estimation)     │
       │    5. Location Service (36 States/UTs & District Data)       │
       │    6. Grounded RAG Chatbot Service (Server-side Gemini)      │
       └──────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
       ┌──────────────────────────────────────────────────────────────┐
       │                   SQLite Database Layer                      │
       │  - Scheme Rules Table (from scheme_rules.csv)                │
       │  - Channel Partners Table (from channel_partners.csv)        │
       │  - Partner Status Table (from partner_status.csv)            │
       │  - Recommendation Logs Table (Auditing & Analytics)          │
       └──────────────────────────────────────────────────────────────┘
```

---

## 📊 Dataset & Semantic Rules (FINAL V6 Source of Truth)

1. **Schemes**: 5 current primary NSFDC schemes (`MFS`, `AMY`, `TERM_LOAN`, `UNY`, `ELS`).
2. **Alternate Scheme**: `"None"` in `alternate_scheme_option` is a literal valid category meaning **No Alternate Scheme Available** (not missing data).
3. **Channel Partners**: 91 source-backed organization references. Non-fabricated unverified metrics display *"Live status not publicly verified"*.
4. **Partner Locations**: Coordinates are city-level reference estimates. Maps and cards explicitly label locations as *"Approximate location"*.
5. **Applicant Data**: `dataset/applicants.csv` contains 20,000 synthetic records used strictly for benchmarking and unit test evaluation.

---

## 🌐 Supported Languages

UdyamSaarthi strictly supports **two official languages**:
- **English** (`en`)
- **Hindi** (`hi`)

Language toggle selector: `English | हिंदी` (Persisted via `sessionStorage`).

---

## 🛠️ API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and version info |
| `GET` | `/api/schemes` | Returns list of all 5 canonical NSFDC schemes |
| `GET` | `/api/schemes/{scheme_id}` | Detailed parameters for a specific scheme |
| `POST` | `/api/recommend` | Stage 1 eligibility filtering + Stage 2 transparent ranking + explainability |
| `POST` | `/api/calculator/emi` | EMI calculation math supporting moratorium grace periods |
| `GET` | `/api/locations/states` | List of all **36 Indian States and Union Territories** |
| `GET` | `/api/locations/districts/{state}` | District list for a given State or UT |
| `POST` | `/api/partners/nearby` | Filter channel partners by State, District, Partner Category |
| `POST` | `/api/chat` | Grounded RAG AI Assistant answering questions in English or Hindi |

---

## 🚀 How to Run the Application

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup & Startup
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
cd backend
uvicorn app.main:app --reload --port 8000
```
Open API docs at: `http://localhost:8000/docs`

### 3. Frontend Setup & Startup
```bash
# Install frontend dependencies
npm install

# Start Vite frontend dev server
npm run dev
```
Open web app at: `http://localhost:5173`

---

## 🧪 Running Backend Test Suite

To run all automated backend unit and integration tests (20/20 test cases):

```bash
python -m pytest tests/ -v
```

---

## 📁 Directory Structure

```
SIH_2026/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   └── seeder.py
│   │   ├── schemas/
│   │   │   ├── scheme.py
│   │   │   ├── recommendation.py
│   │   │   ├── calculator.py
│   │   │   ├── partner.py
│   │   │   ├── location.py
│   │   │   └── chat.py
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── schemes.py
│   │   │   ├── recommendation.py
│   │   │   ├── calculator.py
│   │   │   ├── partners.py
│   │   │   ├── locations.py
│   │   │   └── chat.py
│   │   └── services/
│   │       ├── recommendation_engine.py
│   │       ├── calculator.py
│   │       ├── partner_locator.py
│   │       ├── location_service.py
│   │       └── chatbot.py
│   ├── data/
│   │   ├── scheme_rules.csv
│   │   ├── channel_partners.csv
│   │   └── partner_status.csv
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── i18n/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── dataset/
│   └── applicants.csv
│
├── tests/
│   ├── test_recommendation_engine.py
│   ├── test_calculator.py
│   ├── test_partner_locator.py
│   ├── test_location_service.py
│   └── test_api_endpoints.py
│
├── PROJECT_AUDIT.md
└── README.md
```
