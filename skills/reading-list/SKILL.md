---
name: reading-list
description: manage a personal reading list with to-read, reading, and done states, and regenerate hub-visible dashboard outputs on every change.
---

# Reading List — Paper Management

Use this skill to maintain the reading workflow and keep the hub-visible reading outputs current.

## Step 0 — Load the research profile first

Primary local path:

- `research-workspace/db/research-profile.yaml`

## Step 1 — Maintain the structured data file

Primary local path:

- `research-workspace/db/reading-list.json`

Recommended schema:

```json
{
  "last_updated": "2026-04-05",
  "papers": [
    {
      "arxiv_id": "2503.19823",
      "title": "AutoRefine: Search and Refine During Think",
      "authors": "Shi et al.",
      "status": "done",
      "date_added": "2026-04-05",
      "score": 4.5,
      "tags": ["LLM Reasoning", "RAG"],
      "note_link": "research-workspace/notes/autorefine-dnl.md"
    }
  ]
}
```

States:

- `to_read`
- `reading`
- `done`

## Step 2 — Support the main operations

- view list
- add paper
- mark as reading
- mark as done
- remove paper

Every change should update the data file and regenerate the workspace-facing dashboard artifact.

## Step 3 — Regenerate the publishable reading-list artifact

Primary output path:

- `research-workspace/reports/reading-list.html`

The output should behave like a three-column reading dashboard that links each paper to its note when available.

## Step 4 — Keep the hub integration clean

The hub should be able to browse:

- the raw JSON in `research-workspace/db/reading-list.json`
- the published dashboard in `research-workspace/reports/reading-list.html`
- linked notes under `research-workspace/notes/`

## Error handling

- If the reading-list file does not exist, initialize it.
- If a paper lacks a note, keep the entry and mark the missing link explicitly.
- If a title match is fuzzy, prefer exact arXiv id when available.
