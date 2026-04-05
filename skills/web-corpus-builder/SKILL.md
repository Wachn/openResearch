---
name: web-corpus-builder
description: targeted web extraction, crawl selection, and content cleanup for research runs. use when the host needs to turn search results or known urls into a structured corpus that downstream skills can evaluate and cite.
---

# Web Corpus Builder

Use this after discovery, not before framing.

## Rules

- prefer targeted extraction over blind crawling
- keep domain, path, and page boundaries explicit
- preserve source urls and timestamps when available
- avoid oversized raw dumps when a concise extract is enough
