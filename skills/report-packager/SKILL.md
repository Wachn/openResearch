---
name: report-packager
description: final markdown, notebook markdown, docx-ready, ppt-ready, or html-ready packaging from normalized research, comparison, draft, and synthesis outputs. use when the host needs a final deliverable that preserves structure, uncertainty, and citation traceability.
---

# Report Packager

Package from normalized artifacts. Do not re-run research here unless required to repair missing citations or broken structure.

## Inputs

- `research.packet`
- `comparison.packet`
- `synthesis.packet`
- `draft.paper`
- `patent.memo`

## Publish targets

Canonical publish locations live under:

- `research-workspace/reports/`

Preferred output set for a synthesis-driven publish flow:

- markdown report
- html report
- machine-readable json companion when useful for hub browsing or downstream tooling

## Packaging workflow

1. choose the requested output mode
2. preserve the section hierarchy from the normalized packet
3. keep uncertainty, citations, and tradeoffs visible
4. if the output is publishable html, emit a hub-visible artifact under `research-workspace/reports/`
5. when useful, emit a json companion so the hub or later tools can consume structured report data directly

## Rules

- Do not erase citations or uncertainty during packaging.
- Do not silently change the meaning of the packet while making it look nicer.
- Prefer markdown as the canonical text form, then derive html-ready or presentation-ready output from that structure.
