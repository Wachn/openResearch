# openResearch Graph Starter

`openResearch` is an embeddable research layer for agentic hosts such as OpenClaw, JiuwenClaw, OpenCode, Claude Code, and similar systems.

This starter is designed around four ideas:

1. `research-pi` stays the root orchestration skill.
2. skills are linked explicitly through manifests, not only by prose in `SKILL.md`.
3. agent roles live in markdown and can delegate to skills or other agents.
4. a graph studio renders the resulting skill, agent, capability, artifact, and context graph.

## What changed from the first starter

- added **skill-to-skill links** inspired by process-driven skill packs
- added **markdown agent profiles** with delegation edges and success metrics
- added **context and rule injection surfaces** for host runtimes
- added **Scrapling-backed web extraction/crawl capability manifests**
- added a **graph studio** so the system stays understandable as it scales

## Repo layout

- `skills/` - portable skills and structured manifests
- `agents/profiles/` - markdown agent characters with delegation links
- `tools/manifests/` - provider-agnostic capability bindings
- `packages/openresearch_core/` - contracts, registry, and graph builder
- `apps/graph-studio/` - local static UI for the dependency graph
- `contexts/` and `rules/` - host-injected repo context
- `graph/compiled/` - generated graph payload
- `examples/` - project and host embedding examples

## Design principles

- host-embedded, not host-replacing
- `SKILL.md` stays portable core logic
- structured manifests make graphing and routing deterministic
- provider names are bindings, not reasoning policy
- research outputs normalize into one canonical `ResearchPacket`
- keep secrets out of skills and version control

## Quick start

```bash
python scripts/build_graph.py
python -m http.server 8000
# then open http://localhost:8000/apps/graph-studio/
```

## Suggested next edits

1. extend `skills/research-pi/manifest.yaml`
2. refine `skills/research-pi/SKILL.md`
3. add more atomic skills under `skills/`
4. add more agent profiles under `agents/profiles/`
5. rebuild the graph with `python scripts/build_graph.py`
