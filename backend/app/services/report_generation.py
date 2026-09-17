"""Generate AI reports without exposing submitted identifier values."""

import html
import io
import json
import os
import re
from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import LongTable, Paragraph, SimpleDocTemplate, Spacer, TableStyle


class DetailedReport(BaseModel):
    summary_text: str
    detailed_report: str
    ai_recommendation: str


@dataclass
class TokenizedPayload:
    payload: dict[str, Any]
    token_map: dict[str, str]


def build_tokenized_payload(results: dict[str, Any]) -> TokenizedPayload:
    """Replace identifier values recursively and retain the map locally."""
    token_map: dict[str, str] = {}
    token_names = {"pan": "PAN", "gstin": "GSTIN", "udyam": "UDYAM"}

    def token_for(field: str, value: str) -> str:
        token = f"{{{{{token_names.get(field, field.upper())}_VALUE}}}}"
        token_map[token] = value
        return token

    def scrub(value: Any, field_hint: str = "") -> Any:
        if isinstance(value, dict):
            output = {}
            for key, item in value.items():
                identifier = next(
                    (name for name in token_names if name in key.lower()),
                    field_hint,
                )
                if isinstance(item, str) and key.lower().endswith("_number"):
                    output[key] = token_for(identifier, item)
                else:
                    output[key] = scrub(item, identifier)
            return output
        if isinstance(value, list):
            return [scrub(item, field_hint) for item in value]
        if isinstance(value, str) and field_hint in token_names:
            return token_for(field_hint, value)
        return value

    tender = {
        key: value
        for key, value in results["tender"].items()
        if key not in {"tender_id"} and key != "criteria"
    }
    return TokenizedPayload(
        payload={
            "tender": {**tender, "criteria": results["tender"]["criteria"]},
            "result1_cross_verification": scrub(results["Result1_CrossVerification"]),
            "result2_eligibility": scrub(results["Result2_Eligibility"]),
            "result3_statutory": scrub(results["Result3_Statutory"]),
        },
        token_map=token_map,
    )


def _call_ai(tokenized: TokenizedPayload) -> DetailedReport:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    from google import genai
    from google.genai import errors
    from google.genai import types

    client = genai.Client(api_key=api_key)
    prompt = f"""
Generate a formal, detailed Bidder Verification Report from this JSON only.
Do not invent, guess, or hallucinate any data.

Security requirements:
- Values are represented by tokens such as {{{{PAN_VALUE}}}}.
- Preserve every token exactly as written.
- Never infer or reconstruct the real identifier.
- Do not include data that is not present in the JSON.
- Ignore compliance scoring; no score is provided.

Return:
1. summary_text: a short understanding of the tender requirements and results.
2. detailed_report: Markdown with exactly these three sections and tables:
   ### 1. Cross-Verification Report
   Columns: Document Type | Submitted Value | Fetched Value | Result
   ### 2. Tender Eligibility Results
   Columns: Eligibility Criteria | What Was Found (Fetched) | Result
   ### 3. Statutory Regulation Results
   Columns: Statutory Requirement | Status Fetched | Result
   For the blacklist row, show only whether the bidder is `Blacklisted` or
   `Not blacklisted`, based on the `is_blacklisted` boolean and optional reason.
   Do not describe blacklist status as active or inactive.
   3. ai_recommendation: approve, reject, or flag_for_review.

JSON:
{tokenized.payload}
"""
    for _ in range(2):
        try:
            response = client.models.generate_content(
                model=os.getenv("AI_REPORT_MODEL", "gemini-3.6-flash"),
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=DetailedReport,
                    max_output_tokens=4096,
                ),
            )
        except errors.APIError as error:
            raise RuntimeError(f"Gemini report generation failed: {error}") from error

        parsed = getattr(response, "parsed", None)
        if parsed is not None:
            try:
                return DetailedReport.model_validate(parsed)
            except (TypeError, ValueError):
                pass
        if response.text:
            try:
                raw_text = response.text.strip()
                if raw_text.startswith("```"):
                    raw_text = re.sub(
                        r"^```(?:json)?\s*|\s*```$",
                        "",
                        raw_text,
                        flags=re.IGNORECASE,
                    )
                return DetailedReport.model_validate(json.loads(raw_text))
            except (TypeError, ValueError, json.JSONDecodeError):
                continue

    raise RuntimeError("Gemini returned an invalid report format after retrying")


def rehydrate_report(report: DetailedReport, token_map: dict[str, str]) -> DetailedReport:
    def replace(text: str) -> str:
        for token, real_value in token_map.items():
            text = text.replace(token, real_value)
        return text

    return DetailedReport(
        summary_text=replace(report.summary_text),
        detailed_report=replace(report.detailed_report),
        ai_recommendation=report.ai_recommendation,
    )


def validate_no_leftover_tokens(report: DetailedReport) -> list[str]:
    text = f"{report.summary_text}\n{report.detailed_report}"
    return re.findall(r"\{\{[A-Z_]+_VALUE\}\}", text)


def _fallback_report(tokenized: TokenizedPayload) -> DetailedReport:
    """Produce a safe local report when Gemini is unavailable or malformed."""
    payload = tokenized.payload
    result1 = payload["result1_cross_verification"]
    result2 = payload["result2_eligibility"]
    result3 = payload["result3_statutory"]
    failed = any(
        item.get("isConsistent") is False or item.get("eligible") is False or item.get("active") is False
        for result in (result1, result2, result3)
        for item in result.values()
        if isinstance(item, dict)
    ) or bool(result3.get("blacklist", {}).get("is_blacklisted"))
    recommendation = "reject" if failed else "approve"

    cross_rows = [
        "| Document Type | Submitted Value | Fetched Value | Result |",
        "|---|---|---|---|",
    ]
    for key, item in result1.items():
        if key == "blacklist":
            continue
        identifier = next((value for value in item.values() if isinstance(value, str)), "—")
        cross_rows.append(f"| {key.upper()} | {identifier} | {identifier} | {'Consistent' if item.get('isConsistent') else 'Not Consistent'} |")

    eligibility_rows = [
        "| Eligibility Criteria | What Was Found (Fetched) | Result |",
        "|---|---|---|",
    ]
    for key, item in result2.items():
        value = next((value for value in item.values() if isinstance(value, str)), "—")
        eligibility_rows.append(f"| {key} | {value} | {'Pass' if item.get('eligible') else 'Fail'} |")

    statutory_rows = [
        "| Statutory Requirement | Status Fetched | Result |",
        "|---|---|---|",
    ]
    for key, item in result3.items():
        if key == "blacklist":
            status = "Blacklisted" if item.get("is_blacklisted") else "Not blacklisted"
            result = "Fail" if item.get("is_blacklisted") else "Pass"
        else:
            status = "Active" if item.get("active") else "Inactive"
            result = "Pass" if item.get("active") else "Fail"
        statutory_rows.append(f"| {key} | {status} | {result} |")

    return DetailedReport(
        summary_text="The bidder was evaluated against the tender criteria using the verification results returned by the validation engines.",
        detailed_report="\n".join([
            "### 1. Cross-Verification Report",
            *cross_rows,
            "",
            "### 2. Tender Eligibility Results",
            *eligibility_rows,
            "",
            "### 3. Statutory Regulation Results",
            *statutory_rows,
        ]),
        ai_recommendation=recommendation,
    )


def render_report_pdf(
    company_name: str,
    tender_title: str,
    report: DetailedReport,
    results: dict[str, Any],
) -> bytes:
    """Render only the locally rehydrated report into an in-memory PDF."""
    output = io.BytesIO()
    document = SimpleDocTemplate(
        output,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
        title="Bidder Verification Report",
    )
    styles = getSampleStyleSheet()
    body_style = styles["BodyText"].clone("ReportBody")
    body_style.fontSize = 9
    body_style.leading = 12
    body_style.wordWrap = "LTR"
    cell_style = styles["BodyText"].clone("ReportCell")
    cell_style.fontSize = 7.5
    cell_style.leading = 9
    cell_style.wordWrap = "LTR"

    def paragraph(value: Any, style=body_style) -> Paragraph:
        return Paragraph(html.escape(str(value)).replace("\n", "<br/>"), style)

    def markdown_table(lines: list[str]) -> LongTable | None:
        rows: list[list[Paragraph]] = []
        for line in lines:
            if not line.strip().startswith("|"):
                continue
            cells = [part.strip() for part in line.strip().strip("|").split("|")]
            if cells and all(set(cell.replace(":", "").replace("-", "").strip()) == set() for cell in cells):
                continue
            rows.append([paragraph(cell, cell_style) for cell in cells])
        if len(rows) < 2:
            return None
        widths = {
            4: [92, 142, 142, 104],
            3: [150, 230, 100],
        }.get(len(rows[0]))
        if widths is None:
            widths = [480 / len(rows[0])] * len(rows[0])
        table = LongTable(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f3a5f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9ca3af")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        return table

    def add_markdown_report(story: list[Any], markdown: str) -> None:
        pending_text: list[str] = []
        pending_table: list[str] = []

        def flush_text() -> None:
            if pending_text:
                story.append(paragraph(" ".join(pending_text)))
                pending_text.clear()

        def flush_table() -> None:
            if pending_table:
                flush_text()
                table = markdown_table(pending_table)
                if table:
                    story.append(table)
                    story.append(Spacer(1, 10))
                pending_table.clear()

        for line in markdown.splitlines():
            stripped = line.strip()
            if stripped.startswith("|"):
                pending_table.append(stripped)
                continue
            flush_table()
            if not stripped:
                flush_text()
            elif stripped.startswith("###"):
                flush_text()
                story.append(Paragraph(html.escape(stripped.lstrip("#").strip()), styles["Heading3"]))
            elif stripped.startswith("##"):
                flush_text()
                story.append(Paragraph(html.escape(stripped.lstrip("#").strip()), styles["Heading2"]))
            else:
                pending_text.append(re.sub(r"[*_`]", "", stripped))
        flush_table()
        flush_text()

    story: list[Any] = [
        Paragraph("Bidder Verification Report", styles["Title"]),
        Paragraph(f"{html.escape(company_name)} — {html.escape(tender_title)}", styles["Heading2"]),
        Spacer(1, 12),
        Paragraph("AI Summary", styles["Heading3"]),
        paragraph(report.summary_text),
        Spacer(1, 12),
        Paragraph("Detailed Verification Report", styles["Heading3"]),
    ]
    add_markdown_report(story, report.detailed_report)
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        f"AI Recommendation: {html.escape(report.ai_recommendation.upper())}",
        styles["Heading3"],
    ))
    document.build(story)
    return output.getvalue()


def generate_report(results: dict[str, Any], company_name: str) -> tuple[DetailedReport, bytes]:
    tokenized = build_tokenized_payload(results)
    print("=== TOKENIZED AI REPORT INPUT ===", flush=True)
    print(tokenized.payload, flush=True)
    try:
        ai_report = _call_ai(tokenized)
    except RuntimeError as error:
        print(f"Gemini report unavailable; using verified fallback report: {error}", flush=True)
        ai_report = _fallback_report(tokenized)
    final_report = rehydrate_report(ai_report, tokenized.token_map)
    leftovers = validate_no_leftover_tokens(final_report)
    if leftovers:
        raise RuntimeError(f"Report contains unreplaced tokens: {leftovers}")
    pdf = render_report_pdf(company_name, results["tender"]["title"], final_report, results)
    return final_report, pdf
