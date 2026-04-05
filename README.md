# openResearch

`openResearch` is a graph-native, host-embedded research kit for agentic systems.

It is designed to be mounted inside hosts such as OpenClaw, JiuwenClaw, OpenCode, Claude Code, and similar runtimes that need a reusable research layer instead of a monolithic standalone application. The repository combines portable skills, markdown agent profiles, provider-agnostic capability manifests, a compiled graph model, and lightweight local browser surfaces for inspecting the resulting system.

The project is built around one core idea: research workflows should be explicit, inspectable, and portable. Instead of hiding behavior inside one huge prompt, `openResearch` breaks the workflow into graphable units such as `research-pi`, `paper-scout`, `paper-reader`, `reading-list`, `research-profile`, `idea-generator`, `evidence-matrix`, and `report-packager`, then renders the relationships between them in a graph and a local research hub.

## What this repository is

This repo is not just a graph starter anymore. It is a working embedded research workspace with three major layers:

1. a metadata-driven research orchestration layer rooted in `research-pi`
2. a Python core that indexes the repo and builds the graph representation
3. local browser UIs for inspecting the graph, the repo, and generated research artifacts

## Core goals

- keep `research-pi` as the root research orchestrator
- keep routing truth in manifests, not only in prose
- preserve portable skill logic in `SKILL.md`
- normalize serious outputs into a canonical `ResearchPacket`-compatible shape
- keep provider bindings abstract through capability names such as `web.search`, `web.extract`, `scholar.search`, and `citation.lookup`
- make the resulting system visually understandable through Graph Studio and Research Hub

## High-level architecture

### 1. Skills

Skills live under `skills/` and are the primary units of behavior. Each skill has:

- `SKILL.md` for the portable logic and execution policy
- `manifest.yaml` for graphable structure such as calls, capabilities, and artifacts

The current skill set is:

| Skill | Role |
|---|---|
| `research-pi` | root orchestrator for research workflows |
| `paper-scout` | profile-aware paper discovery and reading queue creation |
| `paper-reader` | deep reading and note generation |
| `reading-list` | reading workflow and dashboard state |
| `research-profile` | active research direction and preference profile |
| `synthesis` | condensed multi-source synthesis before packaging |
| `idea-generator` | cross-note idea synthesis |
| `web-corpus-builder` | website and documentation corpus collection |
| `source-evaluator` | authority, bias, and credibility scoring |
| `evidence-matrix` | claim-to-evidence traceability |
| `novelty-gap-finder` | research gaps and opportunity synthesis |
| `comparison-research` | comparison-oriented research path |
| `experiment-designer` | experiment planning and framing |
| `paper-writer` | outline, drafting, review, and rebuttal writing |
| `patent-scout` | prior-art and patent-oriented research |
| `report-packager` | final research packaging |
| `research-hub-and-graph` | implementation guide for the hub and graph surfaces |

### 2. Agents

Agent roles live under `agents/profiles/` as markdown files with YAML frontmatter. They define role-level behavior and delegation paths rather than low-level implementation details.

Current profiles:

- `principal-investigator`
- `librarian`
- `skeptic`
- `experimenter`
- `paper-editor`
- `patent-analyst`

### 3. Capability manifests

Capabilities live under `tools/manifests/` and define host-bound tool surfaces without hardcoding a single provider. These include web search, web extraction, crawling, citation lookup, browser sessions, repo search, and scholarly search.

### 4. Python core

The Python package under `packages/openresearch_core/` provides the repo’s programmatic backbone.

Important modules:

- `contracts.py` — core data contracts such as `ResearchPacket`
- `registry.py` — metadata and manifest registry logic
- `graph_builder.py` — graph construction from repo structure and manifests
- `repo_index.py` — safe repo indexing, tree building, file reading, and workspace summaries
- `adapters.py` — glue logic for format adaptation

### 5. Research Hub and Graph Studio

There are two local browser surfaces:

- `apps/research-hub/` — a lightweight Python HTTP server plus a dynamic browser UI for browsing the repo, opening generated artifacts, searching paths, and inspecting workspace state
- `apps/graph-studio/` — a static graph UI for visualizing nodes and edges across skills, artifacts, capabilities, contexts, and related repo entities

## User-facing surfaces

### Research Hub

The Research Hub is the main inspection surface for this repo.

It currently supports:

- repo health and graph summary
- repo search by path
- repo tree browsing
- file viewing for text-like artifacts
- safe metadata previews for binary or non-text files
- dynamic `research-workspace/` browsing
- ResearchClaw-inspired workspace presentation for reports, notes, profile artifacts, and repo captures

The Research Hub exposes these API routes:

- `/api/health`
- `/api/summary`
- `/api/graph`
- `/api/tree`
- `/api/search?q=...`
- `/api/file?path=...`
- `/api/workspace/summary`
- `/api/workspace/tree`

### Graph Studio

Graph Studio renders the compiled graph and is designed to make the skill chain understandable.

It currently supports:

- graph rendering from `window.OPENRESEARCH_GRAPH`
- focused display of the `research-pi` chain
- draggable nodes
- scrollable large graph canvas
- selection details for nodes and links
- graph access through the Hub or a static server

## Research workspace

Generated or reviewable artifacts live under `research-workspace/`.

Current workspace buckets:

- `research-workspace/reports/`
- `research-workspace/notes/`
- `research-workspace/pdfs/`
- `research-workspace/repos/`
- `research-workspace/db/`

The repo currently includes starter artifacts so the hub is immediately navigable:

- a sample reading-list HTML report
- a sample research-profile markdown snapshot
- a sample idea brief
- a sample DNL-style paper note
- a sample repo-capture note
- a sample YAML profile in the database bucket

## Repository map

```text
openResearch/
├── agents/profiles/              # markdown agent profiles
├── apps/
│   ├── graph-studio/             # static graph viewer
│   └── research-hub/             # hub server + browser UI
├── contexts/                     # host-injected project context
├── docs/                         # architecture and design notes
├── examples/                     # host embedding examples
├── graph/compiled/               # generated graph payloads
├── packages/openresearch_core/   # Python core contracts and graph logic
├── research-workspace/           # generated and reviewable research artifacts
├── rules/                        # writing and research rule surfaces
├── schemas/                      # graph and packet schemas
├── scripts/                      # first-party build utilities
├── skills/                       # skill logic + manifests
├── tools/manifests/              # provider-agnostic capability bindings
└── references/                   # reference material and inspiration repos
```

## Running the project

This repository is Python-first.

### Python requirement

- Python `>= 3.10`

### Dependency

The root package currently declares a minimal dependency set:

- `PyYAML>=6.0`

### Environment setup

PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -U pip
pip install PyYAML
```

If you use commands that import `openresearch_core` directly, set `PYTHONPATH=packages`.

PowerShell:

```powershell
$env:PYTHONPATH="packages"
```

### Build graph artifacts

PowerShell:

```powershell
$env:PYTHONPATH="packages"
python scripts/build_graph.py
```

Or:

```powershell
make graph
```

Generated outputs:

- `graph/compiled/openresearch.graph.json`
- `apps/graph-studio/graph.data.js`

### Run the Research Hub

From the repo root:

```powershell
.\.venv\Scripts\python.exe apps/research-hub/server.py --repo-root .
```

Then open:

```text
http://127.0.0.1:8765/
```

Important detail: `apps/research-hub/server.py` already adds `packages/` to `sys.path`, so it does not require `PYTHONPATH` just to run the hub.

### Open Graph Studio

The easiest path is through the hub:

```text
http://127.0.0.1:8765/graph-studio/
```

You can also serve the repo statically after building graph data:

```powershell
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/apps/graph-studio/
```

## Current build and verification posture

This repo currently keeps a very small first-party root-tooling surface.

- retained: `scripts/build_graph.py`
- removed: root manifest-validation and root verification test scripts

There is no default first-party validation or verification command maintained at the root after this cleanup. The main maintained build action is graph generation.

## How the research flow works

At a high level, the intended research workflow is:

1. `research-pi` frames the task
2. `research-profile` establishes the current research taste and focus
3. `paper-scout` builds a reading queue
4. `paper-reader` converts individual papers into durable notes
5. `reading-list` organizes queue state and dashboard outputs
6. `source-evaluator` and `evidence-matrix` ground evidence quality and traceability
7. `synthesis` condenses large note and source sets into a publishable intermediate packet
8. `novelty-gap-finder` and `idea-generator` synthesize opportunity
9. `experiment-designer` and `paper-writer` move toward project or manuscript form
10. `report-packager` produces the final delivery format

That workflow is meant to be inspectable in both the graph and the hub workspace.

## Graph model

The graph is the control-plane view of the repo.

It is intended to show:

- which skills call which skills
- which capabilities each skill needs
- which artifacts are consumed and produced
- which contexts and rules affect execution
- how the overall system composes at scale

The graph is built from repo structure plus manifest metadata, not from one manually curated diagram.

## Design principles

- host-embedded, not host-replacing
- metadata-driven, not purely prompt-driven
- portable logic in `SKILL.md`
- explicit routing through manifests
- capability names over provider names
- generated artifacts kept in a visible workspace
- visually inspectable composition through graph and hub surfaces

## Important docs

If you want more context beyond this README, start here:

- `docs/architecture.md`
- `docs/graph-model.md`
- `docs/research-hub.md`
- `docs/migration-from-origin-skill.md`
- `docs/influences.md`
- `docs/roadmap.md`

## Frontend notes

The frontend in this repo is intentionally lightweight.

- no TypeScript toolchain
- no framework runtime
- plain HTML, CSS, and JavaScript in `apps/graph-studio/` and `apps/research-hub/static/`

That choice is deliberate: the project is supposed to remain portable and easy to embed inside host environments without adding a frontend build system.

## Extending the project

### Add a new skill

1. create `skills/<skill-name>/SKILL.md`
2. create `skills/<skill-name>/manifest.yaml`
3. link it from `research-pi` or another upstream skill if it is part of a real workflow
4. rebuild the graph
5. verify it appears in the hub and graph surfaces

### Add a new generated artifact type

1. place it under the appropriate `research-workspace/` bucket
2. keep the path and role explicit
3. ensure it is either text-viewable or safely previewable in the hub
4. use the workspace summary and tree APIs instead of inventing a separate browsing path unless truly necessary

### Add a new agent profile

1. create the markdown profile under `agents/profiles/`
2. preserve structured YAML frontmatter
3. declare linked skills and delegation behavior explicitly
4. rebuild the graph so the new node becomes visible

## Current caveats

- the repo includes reference material under `references/`; those directories are not the main project surface and should not be confused with the first-party runtime code
- some older docs may describe earlier hub or graph flows; the current source of truth is the code under `apps/`, `packages/openresearch_core/`, and `skills/`
- the graph payload is generated; if graph relationships look stale, rebuild it

## Why this project exists

Large research systems become opaque quickly when everything is hidden in prompts, one-off scripts, or host-specific glue. `openResearch` exists to make those systems legible. It turns research logic into linked, portable components, gives those components a graph model, and provides a local workspace where the resulting artifacts can actually be inspected.

If you want the shortest practical start:

1. create and activate `.venv`
2. install `PyYAML`
3. run `python scripts/build_graph.py` with `PYTHONPATH=packages`
4. start `apps/research-hub/server.py --repo-root .`
5. open the hub and graph studio in the browser
