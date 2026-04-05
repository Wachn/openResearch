# Architecture

`openResearch` is a graph-native, embeddable research layer.

It has five layers:

1. **skills** — portable `SKILL.md`-first capabilities rooted in `research-pi`
2. **agents** — markdown role profiles with delegation edges and stop conditions
3. **capabilities** — provider-agnostic tool bindings such as `web.search`, `web.extract`, `web.crawl`, `scholar.search`, and `citation.lookup`
4. **graph model** — a compiled node/edge view of skills, agents, contexts, artifacts, and capabilities
5. **research hub** — a lightweight local host that exposes the graph and repo as a browsable surface

## Design intent

This project is **not** meant to become a monolithic standalone workstation. It is meant to be embedded inside host agent systems. The Research Hub exists to organize and inspect the linked graph and the local repo while remaining thin enough to mount inside larger hosts.

## Origin in `research-pi`

The uploaded origin skill defines the top-level research orchestration model: thorough research, comparison research, normalization into one canonical research packet, and packaging into report modes such as standard report, docx-ready, ppt-ready, and notebook markdown. The scaffold keeps that role in `research-pi` and moves specialized work into linked atomic skills. fileciteturn1file0

## Hub responsibilities

The hub adds code for:

- serving Graph Studio and graph JSON
- browsing repo files and text artifacts
- searching the repo by path
- surfacing graph metrics for skills, agents, capabilities, artifacts, and contexts
- acting as a local organization layer for the embedded project

## Non-goals

- replacing the host agent runtime
- hard-coding provider APIs into skills
- storing secrets in skill files
- becoming a separate heavyweight research OS

## Future extensions

- add run history and artifact registry
- add git-aware diff views for skills and agents
- add markdown rendering and paper preview panels
- add notebook and experiment artifact browsing
- add host-specific adapters for OpenCode, OpenClaw, and Claude Code
