# Bid Scanner Project Context

This file is a handoff log for future development sessions.

## Repository and branch

- Repository: `D:\Smart India Hackathon\Bid-Scanner`
- Active development branch: `aditya`
- Do not make changes directly on `main` unless explicitly requested.

## Project structure

- `frontend/`: React + TypeScript + Vite procurement officer UI.
- `backend/`: FastAPI backend.
- `database/`: database-related schema files.
- `new_mock_data.json`: legacy source data; the active tender/company flow no longer uses frontend mock data.

## Databases

The application uses two local PostgreSQL databases:

1. `Application`
   - `tenders`
   - `tender_criteria`
   - `companies`
   - `bids`

2. `Verification`
   - `pan_records`
   - `gstin_records`
   - `udyam_records`
   - `gem_blacklist`

Do not commit database passwords. Configure them locally in `backend/.env`:

```env
APPLICATION_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost/Application
VERIFICATION_DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost/Verification
```

The backend loads this file automatically with `python-dotenv`.

## Running the project

Backend:

```powershell
cd "D:\Smart India Hackathon\Bid-Scanner\backend"
python -m uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd "D:\Smart India Hackathon\Bid-Scanner\frontend"
npm run dev
```

Backend health check:

```text
http://127.0.0.1:8000/health
```

## Backend implementation

Main API file:

- `backend/app/main.py`

Important endpoints:

- `GET /api/tenders`
- `GET /api/tenders/{tender_id}`
- `GET /api/tenders/{tender_id}/companies`
- `GET /api/companies/{company_id}`
- `GET /api/tenders/{tender_id}/companies/{company_id}/analysis`
- `POST /api/analyze`

The backend uses SQLAlchemy with Psycopg 3:

- `psycopg[binary]==3.2.10`
- `python-dotenv==1.0.1`

This was selected because the development machine uses Python 3.14 and the old pinned Psycopg 2 package required unavailable C++ build tooling.

## Analyze pipeline

The frontend sends this shape to `POST /api/analyze`:

```json
{
  "tenderId": "T-3001",
  "company": {
    "id": "C-01",
    "name": "Company name",
    "pan": "ABCDE1234A",
    "gstin": "00AAAAA0000A1ZT",
    "udyamNumber": "UDYAM-UP-12-0011111",
    "companyType": "msme",
    "cityState": "Noida, Uttar Pradesh",
    "bidAmount": 4150000
  }
}
```

Pipeline modules:

- `backend/app/services/validation.py`
  - Regex validation for PAN, GSTIN, and Udyam.
  - Adds `isValid` to submitted and extracted fields.

- `backend/app/services/cross_verification.py`
  - Result 1: compares submitted and extracted valid values.
  - Produces `isConsistent`.

- `backend/app/services/compliance_engine.py`
  - Result 2: tender eligibility checks.
  - Result 3: statutory status checks.

- `backend/app/services/analysis_pipeline.py`
  - Orchestrates the full flow.
  - Fetches tender criteria and registry data.
  - Prints the complete AI-ready payload to the backend terminal.

The AI-ready terminal payload includes:

- Tender information.
- Tender-specific criteria, including key, name, and mandatory flag.
- `submitted_bidder`.
- `extracted_bidder`.
- `Result1_CrossVerification`.
- `Result2_Eligibility`.
- `Result3_Statutory`.

The current implementation prints the payload only. It does not call an AI service yet.

## Tokenized AI report flow

The Analyze endpoint now supports the planned report flow:

- `backend/app/services/report_generation.py`
  - Removes raw identifier values from the AI payload.
  - Replaces PAN, GSTIN, and Udyam values with tokens such as `{{PAN_VALUE}}`.
  - Keeps the token map local to the backend.
  - Calls Gemini through the Google GenAI SDK using `GEMINI_API_KEY`.
  - Rehydrates the AI response locally.
  - Rejects reports containing leftover tokens.
  - Generates the final PDF in memory.

The Analyze response now contains:

- `results`
- `report.summary_text`
- `report.detailed_report`
- `report.ai_recommendation`
- `pdfBase64`

The frontend displays the recommendation and summary inline and provides a PDF download button. Compliance scoring is intentionally not part of the AI report yet.

Additional backend environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key
AI_REPORT_MODEL=gemini-3.6-flash
```

The AI report dependencies are declared in `backend/requirements.txt`:

- `google-genai`
- `reportlab`

Gemini troubleshooting notes:

- The available API account did not support the old `gemini-2.0-flash` model.
- The configured model is now `gemini-3.6-flash`.
- Gemini structured JSON responses can be truncated if the output limit is too low.
- The report generator uses `max_output_tokens=4096`.
- The Gemini response parser first uses the SDK's parsed structured response and then falls back to JSON parsing.

## Frontend implementation

Important files:

- `frontend/src/services/tenderService.ts`
- `frontend/src/services/companyService.ts`
- `frontend/src/services/analysisService.ts`
- `frontend/src/pages/TenderDetail.tsx`
- `frontend/src/components/company/CompanyTable.tsx`
- `frontend/src/types/index.ts`

Current bidder UI behavior:

- Tender and bidder data come from FastAPI/PostgreSQL.
- The tender page does not show a “Rank All Companies” control.
- Each bidder has:
  - `View Details`: opens company information inline on the same page.
  - `Analyze`: sends the tender ID and complete company payload to the backend. It does not navigate to another page.

Frontend API base URL:

```env
VITE_API_URL=http://localhost:8000
```

## Validation already performed

- Frontend production build passes:

```powershell
cd frontend
npm run build
```

- Backend Python syntax validation passes:

```powershell
python -m compileall backend\app
```

- `/health` returns `{ "status": "ok" }`.
- `/api/analyze` was tested with seeded `T-3001` / `C-01` data.
- `/api/analyze` was tested successfully through Gemini and returned HTTP 200, an AI recommendation, and a generated PDF.

## Important future notes

- Keep the pipeline modules separated.
- Do not reintroduce frontend mock data for tenders, companies, or analysis.
- Preserve the inline `View Details` behavior.
- Preserve the Analyze request contract unless the backend and frontend are updated together.
- Do not expose or commit local PostgreSQL credentials.
