"""Result 2 and Result 3 tender compliance engines."""

from typing import Any


def eligibility_check(
    criteria: list[dict[str, Any]],
    cross_verification: dict[str, dict[str, Any]],
    submitted: dict[str, dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    result = {}
    for criterion in criteria:
        key = criterion["criterion_key"]
        identifier = {"pan_valid": "pan", "udyam_valid": "udyam", "gst_filing_current": "gstin"}.get(key)
        if identifier:
            result[identifier] = {
                f"{identifier}_number": submitted[identifier]["value"],
                "eligible": bool(cross_verification.get(identifier, {}).get("isConsistent")),
            }
        elif key == "not_blacklisted":
            result["blacklist"] = {"eligible": bool(cross_verification.get("blacklist", {}).get("isConsistent"))}
    return result


def statutory_check(
    required_keys: set[str],
    extracted: dict[str, dict[str, Any]],
    blacklist: dict[str, Any],
) -> dict[str, dict[str, Any]]:
    result = {}
    for key in required_keys:
        field = extracted[key]
        output_name = {"pan": "pan_number", "gstin": "gstin_number", "udyam": "udyam_number"}[key]
        result[key] = {
            output_name: field["value"],
            "active": bool(field["isValid"] and field.get("status") in {"active", "current"}),
        }
    result["blacklist"] = {
        "is_blacklisted": blacklist.get("is_blacklisted"),
        "reason": blacklist.get("reason"),
    }
    return result
