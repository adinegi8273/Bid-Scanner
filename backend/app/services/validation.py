"""Validation and extraction helpers for the bidder analysis pipeline."""

import re
from typing import Any


PAN_PATTERN = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]$")
GSTIN_PATTERN = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]Z[A-Z0-9]$")
UDYAM_PATTERN = re.compile(r"^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$")


def validate_submitted(company: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Attach structural validity to the identifiers submitted by the bidder."""
    values = {
        "pan": company.get("pan"),
        "gstin": company.get("gstin"),
        "udyam": company.get("udyamNumber"),
    }
    patterns = {"pan": PAN_PATTERN, "gstin": GSTIN_PATTERN, "udyam": UDYAM_PATTERN}
    return {
        key: {"value": value, "isValid": bool(value and patterns[key].fullmatch(value))}
        for key, value in values.items()
    }


def validate_extracted(
    submitted: dict[str, dict[str, Any]],
    records: dict[str, dict[str, Any] | None],
    company_name: str,
) -> dict[str, dict[str, Any]]:
    """Normalize mock-registry results into the extraction contract."""
    extracted: dict[str, dict[str, Any]] = {}
    for key, submitted_field in submitted.items():
        record = records.get(key)
        value = record.get("value") if record else submitted_field["value"]
        extracted[key] = {
            "value": value,
            "isValid": bool(record and submitted_field["isValid"]),
        }
        if key == "pan" and record:
            extracted[key]["name"] = company_name
        if record:
            extracted[key]["status"] = record.get("status")
    return extracted
