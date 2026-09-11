# GeM Bid Compliance Verification Platform

> AI-powered integrated bid compliance verification platform for Government e-Marketplace (GeM) procurement — built for Smart India Hackathon (SIH).

<!-- TODO: add banner image / logo here -->
<!-- TODO: add badges (build status, license, tech stack) here -->

## Table of contents

- [Problem statement](#problem-statement)
- [Our approach](#our-approach)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Team](#team)
- [License](#license)

## Problem statement

Government procurement through the Government e-Marketplace (GeM) involves manual, document-intensive verification of multiple statutory and regulatory requirements — Udyam/MSME registration, GST registration and filing, PAN/Income Tax compliance, EPFO/ESIC compliance, Startup India, NSIC, OEM authorization, blacklisting/debarment, and more. This results in significant manual effort, longer tender evaluation time, and possible inconsistencies.

<!-- TODO: paste the full official problem statement text here if required by submission guidelines -->

## Our approach

Procurement officers get a dashboard of tenders assigned to them. For each tender, they can see every bidding company and drill into a full compliance breakdown:

1. The platform fetches each company's statutory documents/records from relevant government portals (via sandboxed/mock adapters for the demo).
2. An AI layer structures the unstructured document/portal data into a clean schema.
3. A transparent, point-based compliance engine scores each company against tender-specific criteria.
4. An explainable AI layer summarizes **why** a company qualifies or doesn't, in plain language — with a detailed report available on demand.
5. Companies bidding on the same tender can be ranked against each other, with AI-generated reasoning for the ranking.
6. **The procurement officer always makes the final qualify/disqualify call** — the system is a decision-support tool, not a decision-maker.

Every verification action is logged in an immutable audit trail.

## Key features

- [ ] Officer dashboard with assigned tenders
- [ ] Per-tender bidder list with compliance status at a glance
- [ ] Udyam/MSME, GST, PAN/IT, EPFO/ESIC, Startup India, NSIC, MCA21, DigiLocker, blacklist checks
- [ ] AI-based document structuring from unstructured certificates/portals
- [ ] Configurable, transparent point-based compliance scoring
- [ ] Risk level classification (low / medium / high)
- [ ] Explainable AI summary + detailed plain-language report
- [ ] Cross-bidder ranking within a tender with AI-generated justification
- [ ] Immutable audit trail of every verification action
- [ ] Officer profile page

<!-- TODO: check items off as you build them, or replace with a real feature table -->

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast dashboard build, component-driven UI |
| Backend API | FastAPI (Python) | Async, same language as the AI engine, auto-generated OpenAPI docs |
| AI verification engine | FastAPI microservice (Python) | Kept separate for clear architectural separation and independent scaling |
| Document OCR | PaddleOCR + PyMuPDF | Strong accuracy on Indian tabular/scanned govt documents |
| Structured extraction | LLM + Instructor + Pydantic | Forces schema-safe, hallucination-free structured output |
| Government portal integration | Sandboxed KYC/GST/PAN aggregator + custom mock adapters | Real sandbox data without needing production govt API access |
| Compliance scoring | Custom rules engine (Python) | Transparent, auditable, defensible for a regulatory use case |
| Explainability | LLM summarization over rule-engine output | Plain-language "why", human stays in control |
| Database | PostgreSQL | Relational integrity for tenders, bids, companies, scores |
| File storage | MinIO (local) / S3-compatible (production) | Scalable storage for uploaded certificates/documents |
| Audit trail | Append-only PostgreSQL table | Simple, queryable, tamper-evident |
| Deployment | Docker Compose | One-command environment for local dev and demo |

<!-- TODO: update this table if any tech choice changes -->

## Architecture

<!-- TODO: paste/link the architecture diagram image from docs/architecture-diagrams/ here -->

Request flow: **Frontend → Backend API → AI Verification Engine → Government Portals (real/mock)**, with the **Database** and **Document Store** backing the Backend and AI layers throughout.

## Project structure

```
gem-compliance-platform/
│
├── frontend/                          # Officer dashboard (React)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/                # Buttons, tables, modals, badges
│   │   │   ├── dashboard/             # Tender list cards, stats widgets
│   │   │   ├── tender/                # Bidder list, tender detail view
│   │   │   ├── company/               # Company profile, doc checklist
│   │   │   ├── scoring/               # Score breakdown, charts
│   │   │   ├── ranking/               # Leaderboard/ranking table
│   │   │   └── explainability/        # XAI summary cards, detailed report view
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── OfficerDashboard.jsx
│   │   │   ├── TenderDetail.jsx
│   │   │   ├── CompanyVerification.jsx
│   │   │   ├── ComplianceReport.jsx
│   │   │   ├── TenderRanking.jsx
│   │   │   └── OfficerProfile.jsx
│   │   ├── services/                  # API calls to backend
│   │   │   ├── tenderService.js
│   │   │   ├── companyService.js
│   │   │   ├── verificationService.js
│   │   │   └── authService.js
│   │   ├── hooks/
│   │   ├── context/                   # Auth context, tender context
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                            # Core API + orchestration (FastAPI)
│   ├── app/
│   │   ├── config/                     # Settings, env config
│   │   ├── models/                     # ORM models
│   │   │   ├── tender.py
│   │   │   ├── company.py
│   │   │   ├── bid.py
│   │   │   ├── document.py
│   │   │   ├── compliance_record.py
│   │   │   ├── officer.py
│   │   │   └── audit_log.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── tender.py
│   │   │   ├── company.py
│   │   │   ├── verification.py
│   │   │   ├── scoring.py
│   │   │   └── ranking.py
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── auth_middleware.py
│   │   │   ├── audit_middleware.py    # Logs every verification action
│   │   │   └── error_handler.py
│   │   ├── services/
│   │   │   ├── govt_api_gateway/      # Wraps calls to govt portals / sandbox / mocks
│   │   │   │   ├── udyam_service.py
│   │   │   │   ├── gst_service.py
│   │   │   │   ├── pan_it_service.py
│   │   │   │   ├── epfo_esic_service.py
│   │   │   │   ├── mca21_service.py
│   │   │   │   ├── digilocker_service.py
│   │   │   │   ├── startup_india_service.py
│   │   │   │   ├── nsic_service.py
│   │   │   │   └── blacklist_service.py
│   │   │   ├── ai_engine_client.py    # Calls the AI microservice
│   │   │   └── audit_service.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── ai-engine/                          # AI verification microservice (FastAPI, Python)
│   ├── app/
│   │   ├── main.py
│   │   ├── document_processing/
│   │   │   ├── ocr_extractor.py       # Unstructured doc → text (PaddleOCR)
│   │   │   ├── nlp_parser.py          # Entity extraction (PAN no., GSTIN, dates)
│   │   │   └── schema_mapper.py       # Maps extracted data to standard schema
│   │   ├── cross_verification/
│   │   │   ├── consistency_checker.py # Cross-checks doc vs portal data
│   │   │   └── discrepancy_detector.py
│   │   ├── scoring/
│   │   │   ├── criteria_engine.py     # Point-based scoring logic
│   │   │   ├── weight_config.py       # Tender-specific weightages
│   │   │   └── risk_classifier.py     # Risk level (Low/Med/High)
│   │   ├── ranking/
│   │   │   └── bidder_ranking.py      # Ranks companies within a tender
│   │   ├── explainability/
│   │   │   ├── summary_generator.py   # Short summary (qualified/not + why)
│   │   │   ├── detailed_report_gen.py # Plain-language detailed report
│   │   │   └── llm_prompts/           # Prompt templates for XAI layer
│   │   ├── models/                    # ML/NLP model wrappers (if any)
│   │   └── utils/
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/
│   ├── migrations/
│   ├── seeders/                       # Mock tender/company data for demo
│   └── schema.sql
│
├── mock-govt-apis/                    # Mock adapters for demo (Udyam/GSTN/EPFO don't
│   │                                  # give public hackathon API access)
│   ├── udyam_mock.py
│   ├── gst_mock.py
│   ├── epfo_mock.py
│   ├── digilocker_mock.py
│   └── sample_responses/              # JSON fixtures mimicking real API shape
│
├── docs/
│   ├── architecture-diagrams/
│   ├── ppt/                           # SIH presentation
│   ├── api-contracts.md
│   └── scoring-rubric.md              # Documented criteria & weights
│
├── docker-compose.yml                 # Spins up frontend + backend + ai-engine + db + minio
├── .env.example
├── .gitignore
└── README.md
```

<!-- TODO: keep this tree in sync as the project evolves -->

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### Run everything with Docker (recommended)

```bash
git clone <repo-url>
cd gem-compliance-platform
cp .env.example .env      # fill in the values
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- AI engine docs: http://localhost:8001/docs
- MinIO console: http://localhost:9001

### Run services individually (local dev)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# AI engine
cd ai-engine
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# Frontend
cd frontend
npm install
npm run dev
```

<!-- TODO: add DB migration/seed commands once migrations are set up -->

## Environment variables

See [`.env.example`](.env.example) for all required variables (database URL, JWT secret, AI engine URL, object storage credentials, sandbox API keys).

<!-- TODO: document any additional env vars as they're added -->

## API overview

<!-- TODO: fill in or link to docs/api-contracts.md with actual endpoint documentation -->

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Officer login |
| GET | `/tenders` | List tenders assigned to the logged-in officer |
| GET | `/tenders/{id}/bids` | List companies bidding on a tender |
| POST | `/verification/{company_id}` | Trigger compliance verification for a company |
| GET | `/scoring/{company_id}` | Get compliance score + risk level |
| GET | `/ranking/{tender_id}` | Get ranked list of bidders for a tender |

## Team

<!-- TODO: add team name, members, and roles -->

| Name | Role |
|---|---|
| | |

## License

<!-- TODO: choose a license (MIT recommended for SIH open-source submissions) and add it to LICENSE -->
