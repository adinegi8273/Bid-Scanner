"""Orchestrates validation, mock extraction, cross-verification and compliance."""

import json
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import Engine

from .compliance_engine import eligibility_check, statutory_check
from .cross_verification import cross_verify
from .validation import validate_extracted, validate_submitted


def _rows(engine: Engine, query: str, params: dict[str, Any]) -> list[dict[str, Any]]:
    with engine.connect() as connection:
        return [dict(row) for row in connection.execute(text(query), params).mappings()]


def _one(engine: Engine, query: str, params: dict[str, Any]) -> dict[str, Any] | None:
    rows = _rows(engine, query, params)
    return rows[0] if rows else None


def run_analysis(
    tender_id: str,
    company: dict[str, Any],
    application_engine: Engine,
    verification_engine: Engine,
) -> dict[str, Any]:
    criteria = _rows(
        application_engine,
        """
        SELECT criterion_key, criterion_name, is_mandatory
        FROM tender_criteria
        WHERE tender_id = :tender_id
        ORDER BY id
        """,
        {"tender_id": tender_id},
    )
    tender = _one(
        application_engine,
        """
        SELECT tender_id, tender_number, title, category, department, status
        FROM tenders WHERE tender_id = :tender_id
        """,
        {"tender_id": tender_id},
    )
    if tender is None:
        raise ValueError(f"Tender {tender_id} was not found")
    tender["criteria"] = criteria

    submitted = validate_submitted(company)
    records: dict[str, dict[str, Any] | None] = {
        "pan": _one(
            verification_engine,
            "SELECT pan_number AS value, status FROM pan_records WHERE pan_number = :value",
            {"value": company.get("pan")},
        ),
        "gstin": _one(
            verification_engine,
            "SELECT gstin AS value, filing_status AS status, linked_pan FROM gstin_records WHERE gstin = :value",
            {"value": company.get("gstin")},
        ),
        "udyam": _one(
            verification_engine,
            "SELECT udyam_number AS value, status, enterprise_type FROM udyam_records WHERE udyam_number = :value",
            {"value": company.get("udyamNumber")},
        ),
    }
    blacklist = _one(
        verification_engine,
        "SELECT is_blacklisted, reason FROM gem_blacklist WHERE udyam_number = :value",
        {"value": company.get("udyamNumber")},
    ) or {"is_blacklisted": False, "reason": None}
    extracted = validate_extracted(submitted, records, company["name"])
    required_keys = {
        {"pan_valid": "pan", "udyam_valid": "udyam", "gst_filing_current": "gstin"}.get(item["criterion_key"])
        for item in criteria
    }
    required_keys.discard(None)
    result1 = cross_verify(submitted, extracted, required_keys)
    if any(item["criterion_key"] == "not_blacklisted" for item in criteria):
        result1["blacklist"] = {"isConsistent": blacklist["is_blacklisted"] is False}
    result2 = eligibility_check(criteria, result1, submitted)
    result3 = statutory_check(required_keys, extracted, blacklist)
    payload = {
        "tender": tender,
        "submitted_bidder": submitted,
        "extracted_bidder": extracted,
        "Result1_CrossVerification": result1,
        "Result2_Eligibility": result2,
        "Result3_Statutory": result3,
    }
    print("=== ANALYSIS INPUT FOR AI ===", flush=True)
    print(json.dumps(payload, indent=2, default=str), flush=True)
    return payload
