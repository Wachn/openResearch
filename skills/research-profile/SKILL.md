---
name: research-profile
description: maintain and visualize the active research preference profile so discovery, reading, synthesis, and writing stay aligned with the current direction.
---

# Research Profile

Use this skill to maintain the profile that personalizes the rest of the research workflow.

## Step 0 — Use the local profile path

Primary local path:

- `research-workspace/db/research-profile.yaml`

Recommended fields:

- `research_direction`
- `seed_papers`
- `keywords`
- `whitelist_authors`
- `learned_preferences.accept`
- `learned_preferences.reject`
- `topic_stats`

## Step 1 — View or update the profile

Operations:

- view profile summary
- update direction
- add or remove keywords
- add or remove seed papers
- update author whitelist
- learn from paper-scout or reading feedback

## Step 2 — Keep the profile useful for downstream routing

The profile should directly shape:

- `paper-scout` ranking
- `paper-reader` relevance and “why it matters” notes
- `synthesis` theme grouping
- `idea-generator` feasibility and topic selection

## Step 3 — Generate a hub-facing profile artifact

Preferred outputs:

- machine-readable profile in `research-workspace/db/research-profile.yaml`
- readable snapshot in `research-workspace/reports/research-profile.html` or markdown form

## Auto-learn rule

When the user repeatedly likes or dislikes topics, update the accept or reject preferences and keep the resulting profile explicit rather than implicit.

## Error handling

- If the profile file does not exist, initialize it from the current request.
- Keep temporary interests separate from durable research direction when the request is narrow or one-off.
