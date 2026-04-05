---
name: paper-scout
description: discover and rank arXiv and scholarly papers against the current research profile, then hand the strongest results into the reading and synthesis workflow.
---

# Paper Scout — Daily and Targeted Paper Discovery

Use this skill when the user needs fresh paper discovery, a ranked reading queue, or arXiv-first paper search.

## Step 0 — Load the research profile first

Primary local path:

- `research-workspace/db/research-profile.yaml`

If the file is missing, fall back to the current request plus reasonable defaults and say the profile is incomplete.

Important profile fields:

- `research_direction`
- `seed_papers`
- `keywords`
- `whitelist_authors`
- `learned_preferences.accept`
- `learned_preferences.reject`

## Step 1 — Build the arXiv-first query set

This skill should inherently support arXiv API search.

Primary arXiv API pattern:

```text
http://export.arxiv.org/api/query?search_query=all:{KEYWORD}&sortBy=submittedDate&sortOrder=descending&max_results=25&start=0
```

Rules:

1. replace spaces with `+`
2. build 2-4 keyword clusters from the profile
3. include seed-paper themes when a seed list exists
4. prefer recent papers when the request is about current signals or daily discovery

## Step 2 — Fetch through concrete repo capability paths

Back the paper discovery with the exact repo capability bindings:

- `scholar.search` -> `tools/manifests/scholar-search.yaml`
- `web.extract` -> `tools/manifests/scrapling-web-extract.yaml`

Use `scholar.search` when the host has a strong scholarly binding. Use `web.extract` for direct arXiv API or arXiv page retrieval when the host needs explicit URL extraction.

## Step 3 — Parse, filter, and score

For each candidate, collect:

- title
- authors
- abstract
- arXiv id or canonical paper url
- published date
- category or venue information when available

Score each candidate with profile-aware signals:

- title keyword hit
- abstract keyword density
- whitelist-author match
- seed-paper topical overlap
- novelty signals such as propose, novel, outperform, benchmark
- reject-topic penalties

Prefer the top 5 by default, or top 10 when the user explicitly asks for more.

## Step 4 — Output and handoff

Return a ranked queue with:

- why it matters
- why it matches the current profile
- whether it should go to `paper-reader`
- whether it should be added to `reading-list`

When the task is operational rather than conversational, persist the queue through the reading workflow instead of leaving it as chat-only output.

## Step 5 — Learn from feedback

If the user likes or rejects results, update the research profile’s accept or reject preferences before the next discovery pass.

## Error handling

- If arXiv returns too few recent papers, broaden the window and say so.
- If the scholarly binding is weak or unavailable, fall back to direct arXiv API extraction.
- If the profile is missing, continue with request-derived keywords but mark ranking confidence lower.
