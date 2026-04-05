# openResearch AGENTS
Treat this repository as a host-embedded research kit with metadata-driven routing.

## Mission and architecture
- Keep `skills/research-pi` as the root research orchestrator.
- Keep research logic in `SKILL.md` and graphable dependencies in `manifest.yaml`.
- Treat markdown and YAML metadata as source of truth; do not hardcode relationships already expressed in metadata.
- Preserve the distinction between atomic skills, orchestration skills, agent roles, and host-bound capabilities.
- Keep provider credentials in host config or environment variables, never in skills or manifests.
- Prefer capability names such as `web.search`, `web.extract`, `scholar.search`, and `citation.lookup` over vendor names.
- Use `contexts/` and `rules/` as host injection surfaces, not as ad hoc docs folders.
- Preserve defensive and legitimate research boundaries only.

## Repository map
- `skills/` - portable skills and structured manifests.
- `agents/profiles/` - markdown agent profiles with YAML frontmatter.
- `tools/manifests/` - capability bindings and tool manifests.
- `packages/openresearch_core/` - Python contracts, registry, graph builder, and repo index.
- `apps/graph-studio/` - static graph viewer driven by generated graph data.
- `apps/research-hub/` - lightweight Python server plus static browser UI for repo inspection.
- `contexts/` and `rules/` - host-injected project context and policy surfaces.
- `graph/compiled/` - generated graph payloads.
- `scripts/` - graph build utilities.

## Build and runtime commands
This repo is Python-first. In this checkout, commands that import `openresearch_core` usually need `packages/` on `PYTHONPATH` unless the package is installed another way.

### Recommended command prefix
- PowerShell: `$env:PYTHONPATH="packages"; <command>`
- bash/zsh: `PYTHONPATH=packages <command>`

### Build / generate
- Build graph artifacts: `python scripts/build_graph.py`
- Make target: `make graph`
- Generated outputs:
  - `graph/compiled/openresearch.graph.json`
  - `apps/graph-studio/graph.data.js`

### Local app commands
- Serve the research hub: `python apps/research-hub/server.py --repo-root .`
- Static quick start for graph studio after generating graph data: `python -m http.server 8000`
- Graph studio URL when using the static server: `http://localhost:8000/apps/graph-studio/`

### Lint / formatting
- No root lint command is currently defined.
- No repo-level formatter or linter config was found at the root.
- Do not invent a formatter policy; follow the local style already present in each area.
- No first-party validation or verification scripts are currently maintained at the repo root.

## Known command caveats
- `scripts/build_graph.py` imports `openresearch_core`, so it needs the package import path available.
- `apps/research-hub/server.py` adds `packages/` to `sys.path` itself; other Python entry points may not.
- `apps/graph-studio/` is static and relies on generated graph data.

## Required file-specific rules
- When adding or changing a skill, update both `skills/<skill-name>/SKILL.md` and `skills/<skill-name>/manifest.yaml`.
- When adding an agent profile, keep YAML frontmatter structured and declare linked skills and delegated agents explicitly.
- When changing graph structure logic, verify both generated outputs still make sense.
- When changing static graph or hub UI behavior, verify the corresponding app in a browser or via the served HTML path.

## Code style conventions
Follow evidence in the existing codebase over personal preference.

### Python
- Use `from __future__ import annotations` in Python modules.
- Use 4-space indentation.
- Prefer small, straightforward functions with explicit return values.
- Use type annotations on functions and dataclass fields.
- Prefer built-in generic syntax like `list[str]` and `dict[str, Any]`.
- Use `@dataclass(slots=True)` for lightweight structured data, matching `contracts.py` and `repo_index.py`.
- Use `Path` from `pathlib` for filesystem logic.
- Prefer explicit, readable dictionary literals over clever abstractions.
- Follow the existing quote style within each file; single quotes are common, but some files intentionally use double quotes.

### Imports
- Order Python imports as standard library, third-party packages, then local package imports.
- Keep imports explicit.
- Do not add unused imports.
- For local package imports, use `openresearch_core...` when code is intended to run with the package import path configured.

### Naming
- Use `snake_case` for Python functions, methods, variables, and helpers.
- Use `PascalCase` for classes.
- Use `UPPER_CASE` for module-level constants.
- Use kebab-case for skill and agent directory/file identifiers such as `research-pi` and `principal-investigator`.
- Keep capability names namespaced with dot notation, for example `web.search`.
- Preserve graph-facing IDs and labels that are derived from repo structure instead of inventing alternate naming schemes.

### Error handling
- Prefer explicit guards and narrow exception handling.
- Validate filesystem boundaries before reading or serving files.
- Raise or convert errors with clear user-facing meaning.
- In the hub server, follow the existing pattern of mapping `FileNotFoundError` to 404 and `ValueError` to 400.
- Never swallow exceptions silently.

### Data and schema conventions
- Preserve `ResearchPacket` as the canonical normalized research output shape.
- Keep serious outputs compatible with `ResearchPacket` fields and semantics.
- Preserve frontmatter structure in agent profile markdown.
- Preserve manifest structure in skill YAML.
- Keep graph payloads compatible with the existing `meta`, `nodes`, `edges`, and `by_type` structure.
- Do not move capability or provider concerns into `SKILL.md` prose if they belong in manifests or host config.

### JavaScript, HTML, and CSS
- The frontend here is plain JavaScript, HTML, and CSS, not TypeScript.
- Follow the local style in `apps/graph-studio/` and `apps/research-hub/static/`.
- Use semicolons in JS.
- Use 2-space indentation in JS and CSS.
- Prefer small DOM-oriented helper functions over framework-style abstractions.
- Keep browser logic defensive and user-visible on failure.
- Preserve the current lightweight, dependency-free approach unless the repo explicitly adopts a frontend toolchain.

## Metadata and writing rules
Reflect the explicit rules in `rules/` when editing metadata files.

### From `rules/research.mdc`
- Prefer primary, official, or scholarly sources.
- Label unsupported claims as tentative.
- Separate facts, inferences, and open questions.
- Normalize serious outputs into a `ResearchPacket`-compatible shape.

### From `rules/writing.mdc`
- Keep frontmatter structured and minimal.
- Prefer imperative instructions for skills.
- Prefer concrete deliverables, workflows, and success metrics for agents.

## Existing instruction files
- Root repo instructions exist in this file and in `contexts/project/AGENTS.md`.
- Additional rule surfaces exist in `rules/research.mdc` and `rules/writing.mdc`.
- No `.cursor/rules/` directory or `.cursorrules` file was found in this repository.
- No `.github/copilot-instructions.md` file was found in this repository.

## Practical guidance for coding agents
- Prefer minimal, local changes over broad refactors.
- Match the style of the file you are editing.
- Do not replace metadata-driven structure with hardcoded logic unless the existing design already does so.
- If you add a new skill, agent, rule, or context surface, keep the graphable relationships explicit.
- If you touch generated graph outputs, make sure the source code or metadata that produces them is also correct.
- If a command fails because of environment setup, document the setup requirement instead of pretending the command is broken.

## Before finishing a change
- Rebuild the graph when graph-related code or metadata changed.
- Verify browser-facing changes in `apps/graph-studio/` or `apps/research-hub/` when you touch them.
