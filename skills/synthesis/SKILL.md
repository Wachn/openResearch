---
name: synthesis
description: synthesize long-form literature, pdf notes, and internet-source extractions into condensed packets that can feed research-pi, comparison analysis, and published reports.
---

# Synthesis

Condense many source artifacts into one decision-useful packet.

## Goal

Use `paper-reader` outputs, extracted web corpora, and evidence packets to create an abridged but traceable synthesis that `research-pi` can use for deep-dive research and tradeoff analysis.

## Inputs

- `research-workspace/notes/*.md`
- `research-workspace/db/reading-list.json`
- outputs from `web-corpus-builder`
- outputs from `evidence-matrix`
- profile guidance from `research-workspace/db/research-profile.yaml`

## Workflow

### Step 0 — Load the profile and source set

1. Load the current research profile when present.
2. Collect the papers, notes, urls, or extracted source packets selected for synthesis.
3. If a long-form source has not been condensed yet, route it through `paper-reader` first instead of synthesizing raw content blindly.

### Step 1 — Create source briefs

For each source, reduce it to:

- title or source name
- one-sentence why-it-matters
- main claim or contribution
- concrete numbers, methods, or mechanisms
- limitations, caveats, or unknowns
- relevance to the current research direction

### Step 2 — Merge across sources

Group the source briefs by theme:

- repeated findings
- conflicting evidence
- shared limitations
- tradeoff patterns
- opportunity or gap signals

### Step 3 — Produce a synthesis packet

The synthesis packet should include:

- topic or decision frame
- source set summary
- key findings by theme
- tradeoffs or disagreements
- open questions
- implications for the next research or writing step

### Step 4 — Hand off to publish flow

If the user needs a visible report, pass the synthesis packet to `report-packager` so it can emit markdown, html, or structured publishable output under `research-workspace/reports/`.

## Rules

- Do not erase uncertainty when condensing.
- Prefer concrete findings over broad summaries.
- Mark what came from literature notes versus web or documentation sources.
- Use `synthesis` before Feature 1 Step 4 and Feature 2 Step 3 when the source set is too large for direct root-skill reasoning.
