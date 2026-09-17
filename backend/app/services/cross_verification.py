"""Result 1: compare valid submitted identifiers with registry identifiers."""

from typing import Any


def cross_verify(
    submitted: dict[str, dict[str, Any]],
    extracted: dict[str, dict[str, Any]],
    required_keys: set[str],
) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    output_names = {"pan": "pan_number", "gstin": "gstin_number", "udyam": "udyam_number"}
    for key in required_keys:
        submitted_field = submitted[key]
        extracted_field = extracted[key]
        result[key] = {
            output_names[key]: submitted_field["value"],
            "isConsistent": bool(
                submitted_field["isValid"]
                and extracted_field["isValid"]
                and submitted_field["value"] == extracted_field["value"]
            ),
        }
    return result
