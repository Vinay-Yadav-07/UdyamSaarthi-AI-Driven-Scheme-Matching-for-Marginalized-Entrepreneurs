# PROJECT AUDIT: UdyamSaarthi

**Date:** September 9, 2026  
**Project Name:** UdyamSaarthi  
**Tagline:** "Your Path to the Right Government Scheme"  
**SIH Problem Statement ID:** SIH26092 (Ministry of Social Justice and Empowerment - MoSJE / NSFDC)

---

## 1. Executive Summary & Existing Project Assessment

The existing codebase was a single-page, frontend-only React prototype named **SchemeSetu**. It performed scheme matching client-side using hardcoded JavaScript data files (`src/data/schemes.js` and `src/data/partners.js`), direct client-side Google Gemini SDK calls, and client-side EMI math.

### Key Issues with Current Prototype:
1. **Frontend-Only Architecture:** Business logic, scheme rules, and matching calculations were tied directly into React components (`App.jsx`), making it impossible to audit, scale, or validate independently.
2. **Outdated Branding & References:** Brand name "SchemeSetu", old domain references, and placeholder emails (`support@schemesetu.gov.in`) present across `package.json`, `index.html`, `App.jsx`, and `README.md`.
3. **Hardcoded Data Files:** `src/data/schemes.js` and `src/data/partners.js` deviate from the official FINAL V6 dataset.
4. **Unsupported Language:** Included Assamese (`as`) alongside English and Hindi, whereas the official requirement specifies **only English and Hindi**.
5. **Limited Location Selection:** Hardcoded state list in the form rather than a complete, searchable list of all 36 Indian States and Union Territories with dependent district selection.
6. **Client-Side API Keys:** Gemini API key was loaded in the browser frontend via `VITE_GEMINI_API_KEY`, posing security risks.

---

## 2. Dataset Analysis (FINAL V6 Source of Truth)

The project root contains six authoritative V6 files:
1. `applicants.csv` (20,000 synthetic applicant records for testing, evaluation, and rule validation)
2. `scheme_rules.csv` (5 canonical NSFDC scheme definitions: MFS, AMY, TERM_LOAN, UNY, ELS)
3. `channel_partners.csv` (41 source-backed partner institution references)
4. `partner_status.csv` (41 partner status records with un-fabricated live operational fields)
5. `README.txt` (Dataset documentation, rules, and semantic constraints)
6. `validation_report.txt` (Validation audit verifying 28/28 checks pass)

### Essential Data Semantics & Constraints:
- **`alternate_scheme_option = 'None'`**: Means **No Alternate Scheme Available**; it is a valid categorical state, NOT missing/null data.
- **Partner Count (41 vs 102)**: NSFDC officially states 102 channel partners. The dataset contains 41 source-backed references and **intentionally does not fabricate** the remaining 61 missing partner identities.
- **Partner Coordinates**: Coordinates are **city-level reference estimates**, not exact branch GPS points. The UI must explicitly label locations as **"Approximate location"**.
- **Live Partner Metrics**: NPA %, overdue amounts, fund utilization %, and active status are not fabricated ("Not publicly verified"). The UI must state **"Live status not publicly verified"** when unverified.
- **Synthetic Applicant Data**: `applicants.csv` is strictly for testing, benchmark evaluation, and rule validation.

---

## 3. Retain, Remove, and Rebuild Strategy

| Strategy | Items | Rationale / Action |
| :--- | :--- | :--- |
| **RETAIN (Conceptually)** | - Interactive Leaflet Map component<br>- Multi-step recommendation flow concept<br>- EMI Calculator with moratorium logic concept<br>- RAG Chatbot concept | Transition these concepts into dynamic components powered strictly by backend APIs. |
| **REMOVE** | - Old branding ("SchemeSetu", `schemesetu`, old titles)<br>- `src/data/schemes.js` and `src/data/partners.js`<br>- Assamese (`as`) translations<br>- Client-side Gemini SDK execution<br>- Client-side scheme matching logic in React | Eliminate frontend hardcoded logic, security hazards, and deprecated code. |
| **REBUILD** | - Python FastAPI backend architecture<br>- Rule-based Recommendation Engine & Ranking System<br>- SQLite Database layer and CSV seeders<br>- EMI Calculator Backend Service<br>- Geospatial Partner Locator Backend Service<br>- Grounded RAG AI Chatbot Backend Service<br>- Complete UI/UX redesign for **UdyamSaarthi**<br>- I18n subsystem (English & Hindi only)<br>- Location cascade (28 States + 8 UTs -> Districts) | Implement full-stack production architecture compliant with SIH requirements. |

---

## 4. Proposed New Architecture

```
                       UdyamSaarthi Architecture
                       
   ┌──────────────────────────────────────────────────────────────┐
   │                   React + Vite Frontend                      │
   │  - UdyamSaarthi UI Design (Tailwind CSS + Lucide Icons)      │
   │  - Modular Pages: Home, Eligibility, Recommendations,        │
   │    EMI Calculator, Partner Locator, AI Assistant             │
   │  - I18n Engine (English & Hindi)                             │
   │  - Searchable 36 State/UT + District Dropdowns               │
   └──────────────────────────────┬───────────────────────────────┘
                                  │ REST API (JSON)
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                    Python FastAPI Backend                    │
   │  - API Endpoints (/api/schemes, /api/recommend, etc.)        │
   │  - Pydantic Validation & Error Handling                      │
   │  ┌────────────────────────────────────────────────────────┐  │
   │  │ Core Services:                                         │  │
   │  │ 1. Recommendation Engine (Stage 1 Filter + Stage 2 Rank)│  │
   │  │ 2. Explainability Engine ("WHY THIS SCHEME?")          │  │
   │  │ 3. EMI Calculator Service (Moratorium & Schedule Math) │  │
   │  │ 4. Geospatial Partner Locator (City-level estimation)  │  │
   │  │ 5. Location Service (36 States/UTs & District Data)    │  │
   │  │ 6. Grounded RAG Chatbot Service (Server-side Gemini)   │  │
   │  └────────────────────────────────────────────────────────┘  │
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

## 5. Proposed Folder Structure

```
UdyamSaarthi/
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── ...
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LanguageSelector.jsx
│   │   │   ├── LocationDropdown.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   └── MapView.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CheckEligibilityPage.jsx
│   │   │   ├── RecommendationsPage.jsx
│   │   │   ├── EmiCalculatorPage.jsx
│   │   │   ├── PartnerLocatorPage.jsx
│   │   │   └── AiAssistantPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── i18n/
│   │   │   ├── en.js
│   │   │   ├── hi.js
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── db/
│   │   │   ├── database.py
│   │   │   ├── models.py
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
│   │   ├── services/
│   │   │   ├── recommendation_engine.py
│   │   │   ├── calculator.py
│   │   │   ├── partner_locator.py
│   │   │   ├── location_service.py
│   │   │   └── chatbot.py
│   │   └── utils/
│   ├── data/
│   │   ├── scheme_rules.csv
│   │   ├── channel_partners.csv
│   │   └── partner_status.csv
│   ├── requirements.txt
│   └── .env.example
│
├── dataset/
│   └── applicants.csv
│
├── tests/
│   ├── test_recommendation_engine.py
│   ├── test_calculator.py
│   ├── test_partner_locator.py
│   ├── test_location_service.py
│   ├── test_chatbot.py
│   └── test_api_endpoints.py
│
├── PROJECT_AUDIT.md
└── README.md
```
