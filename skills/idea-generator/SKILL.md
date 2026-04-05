---
name: idea-generator
description: analyze connections across reading notes, synthesis packets, and profile preferences to generate actionable research ideas.
---

# Idea Generator — Cross-Source Insights

Use this skill after the reading and synthesis layers have real material to work with.

## Step 0 — Load the profile and reading state first

Primary local paths:

- `research-workspace/db/research-profile.yaml`
- `research-workspace/db/reading-list.json`

## Step 1 — Gather the usable corpus

Prefer papers or sources that are already in `reading` or `done` state.

For each source, pull from:

- `paper-reader` notes
- `synthesis.packet` outputs
- `evidence-matrix` artifacts when available

If fewer than 3 meaningful notes exist, say the evidence base is thin before generating ideas.

## Step 2 — Identify gaps and opportunity patterns

Look for:

- recurring limitations across papers
- methods that have not been combined
- evaluation gaps
- domain-transfer opportunities
- scaling or deployment questions

## Step 3 — Generate 3-5 ideas

Each idea should include:

- problem statement
- proposed approach
- related notes or papers
- feasibility
- why-now framing

## Step 4 — Persist the best candidate

When the workflow is operational, write a hub-visible artifact such as:

- `research-workspace/reports/idea-brief.md`

## Rules

- Prefer cross-paper synthesis over isolated brainstorming.
- If a proposed idea still needs evidence, say so and route back through `synthesis` or `paper-reader`.
