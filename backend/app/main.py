"""Read-only API for the Bid Scanner application databases."""

import os
import base64
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from .services.analysis_pipeline import run_analysis
from .services.report_generation import generate_report


load_dotenv()

APPLICATION_DATABASE_URL = os.getenv(
    "APPLICATION_DATABASE_URL",
    "postgresql://postgres:postgres@localhost/Application",
)
VERIFICATION_DATABASE_URL = os.getenv(
    "VERIFICATION_DATABASE_URL",
    "postgresql://postgres:postgres@localhost/Verification",
)

# SQLAlchemy needs the Psycopg 3 dialect when running on Python 3.14.
APPLICATION_DATABASE_URL = APPLICATION_DATABASE_URL.replace(
    "postgresql://", "postgresql+psycopg://", 1
)
VERIFICATION_DATABASE_URL = VERIFICATION_DATABASE_URL.replace(
    "postgresql://", "postgresql+psycopg://", 1
)

application_engine: Engine | None = None
verification_engine: Engine | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global application_engine, verification_engine
    application_engine = create_engine(APPLICATION_DATABASE_URL, pool_pre_ping=True)
    verification_engine = create_engine(VERIFICATION_DATABASE_URL, pool_pre_ping=True)
    yield
    application_engine.dispose()
    verification_engine.dispose()


app = FastAPI(title="Bid Scanner API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class TenderSummary(BaseModel):
    id: str
    tenderNumber: str
    title: str
    category: str | None
    department: str | None
    value: float | None
    deadline: str | None
    status: str
    bidderCount: int


class TenderDetail(TenderSummary):
    complianceCriteria: list[str]


class Company(BaseModel):
    id: str
    name: str
    pan: str
    gstin: str | None
    udyamNumber: str | None
    companyType: str | None
    cityState: str | None
    bidAmount: float | None


class VerificationResult(BaseModel):
    panStatus: str | None
    gstLinkedPan: str | None
    gstFilingStatus: str | None
    udyamEnterpriseType: str | None
    udyamStatus: str | None
    isBlacklisted: bool | None
    blacklistReason: str | None


class CriterionResult(BaseModel):
    key: str
    name: str
    mandatory: bool
    status: str
    evidence: str


class CompanyAnalysis(BaseModel):
    company: Company
    verification: VerificationResult
    criteria: list[CriterionResult]


class AnalyzeRequest(BaseModel):
    tenderId: str
    company: Company


def _application() -> Engine:
    if application_engine is None:
        raise HTTPException(status_code=503, detail="Application database is not ready")
    return application_engine


def _verification() -> Engine:
    if verification_engine is None:
        raise HTTPException(status_code=503, detail="Verification database is not ready")
    return verification_engine


def _rows(engine: Engine, query: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    with engine.connect() as connection:
        return [dict(row) for row in connection.execute(text(query), params or {}).mappings()]


def _one(engine: Engine, query: str, params: dict[str, Any]) -> dict[str, Any] | None:
    rows = _rows(engine, query, params)
    return rows[0] if rows else None


def _tender(row: dict[str, Any]) -> TenderSummary:
    return TenderSummary(
        id=row["tender_id"],
        tenderNumber=row["tender_number"],
        title=row["title"],
        category=row["category"],
        department=row["department"],
        value=float(row["estimated_value"]) if row["estimated_value"] is not None else None,
        deadline=row["submission_deadline"].isoformat() if row["submission_deadline"] else None,
        status=row["status"],
        bidderCount=int(row["bidder_count"]),
    )


def _company(row: dict[str, Any]) -> Company:
    return Company(
        id=row["company_id"],
        name=row["legal_name"],
        pan=row["pan"],
        gstin=row["gstin"],
        udyamNumber=row["udyam_number"],
        companyType=row["company_type"],
        cityState=row["city_state"],
        bidAmount=float(row["bid_amount"]) if row["bid_amount"] is not None else None,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/tenders", response_model=list[TenderSummary])
def get_tenders() -> list[TenderSummary]:
    rows = _rows(
        _application(),
        """
        SELECT t.*, COUNT(b.bid_id) AS bidder_count
        FROM tenders t
        LEFT JOIN bids b ON b.tender_id = t.tender_id
        GROUP BY t.tender_id
        ORDER BY t.submission_deadline
        """,
    )
    return [_tender(row) for row in rows]


@app.get("/api/tenders/{tender_id}", response_model=TenderDetail)
def get_tender(tender_id: str) -> TenderDetail:
    row = _one(
        _application(),
        """
        SELECT t.*, COUNT(b.bid_id) AS bidder_count
        FROM tenders t
        LEFT JOIN bids b ON b.tender_id = t.tender_id
        WHERE t.tender_id = :tender_id
        GROUP BY t.tender_id
        """,
        {"tender_id": tender_id},
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Tender not found")
    criteria = _rows(
        _application(),
        "SELECT criterion_name FROM tender_criteria WHERE tender_id = :tender_id ORDER BY id",
        {"tender_id": tender_id},
    )
    return TenderDetail(**_tender(row).model_dump(), complianceCriteria=[item["criterion_name"] for item in criteria])


@app.get("/api/tenders/{tender_id}/companies", response_model=list[Company])
def get_tender_companies(tender_id: str) -> list[Company]:
    rows = _rows(
        _application(),
        """
        SELECT c.*, b.bid_amount
        FROM companies c
        JOIN bids b ON b.company_id = c.company_id
        WHERE b.tender_id = :tender_id
        ORDER BY c.legal_name
        """,
        {"tender_id": tender_id},
    )
    return [_company(row) for row in rows]


@app.post("/api/analyze")
def analyze_company(request: AnalyzeRequest) -> dict[str, Any]:
    """Run verification, generate a token-safe AI report, and return its PDF."""
    print(
        f"Analyze request received: tender_id={request.tenderId}, "
        f"company={request.company.model_dump()}",
        flush=True,
    )
    try:
        results = run_analysis(
            request.tenderId,
            request.company.model_dump(),
            _application(),
            _verification(),
        )
        report, pdf = generate_report(results, request.company.name)
        return {
            "status": "received",
            "results": results,
            "report": report.model_dump(),
            "pdfBase64": base64.b64encode(pdf).decode("ascii"),
        }
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@app.get("/api/companies/{company_id}", response_model=Company)
def get_company(company_id: str) -> Company:
    row = _one(
        _application(),
        """
        SELECT company_id, legal_name, pan, gstin, udyam_number, company_type, city_state,
               NULL::numeric AS bid_amount
        FROM companies
        WHERE company_id = :company_id
        """,
        {"company_id": company_id},
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return _company(row)


@app.get(
    "/api/tenders/{tender_id}/companies/{company_id}/analysis",
    response_model=CompanyAnalysis,
)
def get_company_analysis(tender_id: str, company_id: str) -> CompanyAnalysis:
    company_row = _one(
        _application(),
        """
        SELECT c.*, b.bid_amount
        FROM companies c
        JOIN bids b ON b.company_id = c.company_id
        WHERE b.tender_id = :tender_id AND c.company_id = :company_id
        """,
        {"tender_id": tender_id, "company_id": company_id},
    )
    if company_row is None:
        raise HTTPException(status_code=404, detail="Company bid not found for tender")

    company = _company(company_row)
    verification_row = _one(
        _verification(),
        """
        SELECT
          p.status AS pan_status,
          g.linked_pan AS gst_linked_pan,
          g.filing_status AS gst_filing_status,
          u.enterprise_type AS udyam_enterprise_type,
          u.status AS udyam_status,
          COALESCE(bl.is_blacklisted, false) AS is_blacklisted,
          bl.reason AS blacklist_reason
        FROM (
          SELECT CAST(:pan AS varchar) AS pan,
                 CAST(:gstin AS varchar) AS gstin,
                 CAST(:udyam AS varchar) AS udyam
        ) submitted
        LEFT JOIN pan_records p ON p.pan_number = submitted.pan
        LEFT JOIN gstin_records g ON g.gstin = submitted.gstin
        LEFT JOIN udyam_records u ON u.udyam_number = submitted.udyam
        LEFT JOIN gem_blacklist bl ON bl.udyam_number = submitted.udyam
        """,
        {"pan": company.pan, "gstin": company.gstin, "udyam": company.udyamNumber},
    )
    if verification_row is None:
        raise HTTPException(status_code=502, detail="Verification lookup failed")

    verification = VerificationResult(
        panStatus=verification_row["pan_status"],
        gstLinkedPan=verification_row["gst_linked_pan"],
        gstFilingStatus=verification_row["gst_filing_status"],
        udyamEnterpriseType=verification_row["udyam_enterprise_type"],
        udyamStatus=verification_row["udyam_status"],
        isBlacklisted=verification_row["is_blacklisted"],
        blacklistReason=verification_row["blacklist_reason"],
    )
    criteria = []
    for criterion in _rows(
        _application(),
        """
        SELECT criterion_key, criterion_name, is_mandatory
        FROM tender_criteria
        WHERE tender_id = :tender_id
        ORDER BY id
        """,
        {"tender_id": tender_id},
    ):
        key = criterion["criterion_key"]
        if key == "pan_valid":
            passed = verification.panStatus == "active"
            evidence = verification.panStatus or "No PAN record found"
        elif key == "udyam_valid":
            passed = verification.udyamStatus == "active"
            evidence = verification.udyamStatus or "No Udyam record found"
        elif key == "gst_filing_current":
            passed = verification.gstFilingStatus == "current"
            evidence = verification.gstFilingStatus or "GSTIN not found"
        elif key == "not_blacklisted":
            passed = verification.isBlacklisted is False
            evidence = "Blacklisted" if verification.isBlacklisted else "Not blacklisted"
        else:
            passed = False
            evidence = "Not supported"
        criteria.append(
            CriterionResult(
                key=key,
                name=criterion["criterion_name"],
                mandatory=criterion["is_mandatory"],
                status="Passed" if passed else "Failed",
                evidence=evidence,
            )
        )
    return CompanyAnalysis(company=company, verification=verification, criteria=criteria)