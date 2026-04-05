---
name: paper-reader
description: deep-read an arXiv paper, pdf-backed note, or long-form web source and generate a structured DNL-style reading note for the hub workspace.
---

# Paper Reader — Deep Reading Notes

Use this skill to turn one paper or long-form source into a durable note packet.

## Step 0 — Load the research profile first

Primary local path:

- `research-workspace/db/research-profile.yaml`

Use it to decide relevance, tagging, and the final “why it matters” section.

## Step 1 — Resolve the source

Supported inputs:

- arXiv abstract links
- arXiv pdf links
- bare arXiv ids
- long-form research urls already extracted by `web-corpus-builder`
- pdf-derived content that already exists inside the workspace

## Step 2 — Fetch metadata and content

Use these exact bindings when needed:

- `tools/manifests/scholar-search.yaml`
- `tools/manifests/scrapling-web-extract.yaml`
- `tools/manifests/citation-lookup.yaml`

For arXiv-first cases, gather:

- abstract page metadata
- html page when available for figure and section extraction
- pdf link for reference

## Step 3 — Produce the DNL note structure

Each reading note should contain:

1. metadata
2. one-sentence why-read summary
3. context, related work, gap, and proposal summary
4. key figures or source artifacts when available
5. experiment or evidence highlights
6. why-it-matters for the current research direction
7. actionable next steps
8. explicit rating or confidence explanation when useful

## Step 4 — Write the workspace artifact

Default output location:

- `research-workspace/notes/`

Preferred default format:

- markdown note

Optional publishable output:

- html report under `research-workspace/reports/`

Use real numbers and concrete evidence whenever available. Never leave placeholder values in final notes.

## Step 5 — Handoff

Link the resulting note into:

- `reading-list` for workflow state
- `synthesis` for condensed cross-source analysis
- `paper-writer` for manuscript or outline support when relevant

## Error handling

- If full html or pdf extraction fails, produce an abstract-only note and mark it clearly.
- If figures are missing, keep the note useful rather than fabricating figure detail.
- If the source is not a paper but still long-form research content, keep the same structured-note discipline.
