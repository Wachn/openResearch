---
name: paper-writer
description: help write research papers with outline generation, section drafting, auto-review, and rebuttal workflows grounded in reading notes, synthesis packets, and research packets.
---

# Paper Writer — Research Writing Assistant

Use this skill when the workflow has progressed from evidence gathering into manuscript production.

## Supported modes

### A. Outline generation

Inputs:

- idea brief
- synthesis packet
- related reading notes
- optional venue target

Outputs:

- working title
- core claim
- section outline
- evidence still missing per section

### B. Section drafting

Draft:

- introduction
- related work
- method
- experiments
- conclusion

Rules:

- do not invent results
- cite missing evidence gaps explicitly
- use synthesis and paper-reader outputs instead of generic summaries

### C. Auto-review

Review for:

- novelty
- technical soundness
- experimental quality
- clarity
- related-work coverage

Return critical issues, major concerns, minor suggestions, and strengths.

### D. Rebuttal helper

Parse reviewer comments, categorize issues, and draft concise point-by-point responses.

## Handoff and publish

When the user needs a presentable artifact, route the final structured draft or outline through `report-packager` so it becomes a hub-visible published report.

## Rules

- Never invent metrics, ablations, or citations.
- If the idea is still immature, go back to `idea-generator` or `synthesis` before over-drafting.
