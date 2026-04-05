# openResearch AGENTS
Treat this repository as a **host-embedded research kit**.

## Mission and architecture
- Keep `skills/research-pi` as the root research orchestrator.
- Keep research logic in `SKILL.md`, and graphable dependencies in `manifest.yaml`.
- Treat markdown and YAML metadata as source of truth.
- Preserve the distinction between atomic skills, orchestration skills, agent roles, and host-bound capabilities.
- Keep provider credentials in host config or environment variables, never in skills.
- Prefer capability names such as `web.search`, `web.extract`, `scholar.search`, and `citation.lookup` over vendor names.
- Use `contexts/` and `rules/` as injection surfaces for compatible hosts.
- Preserve defensive and legitimate research boundaries only.

## Repository map
- `skills/` - portable skills and structured manifests
- `agents/profiles/` - markdown agent profiles with frontmatter
- `tools/manifests/` - capability bindings
- `packages/openresearch_core/` - Python contracts, registry, graph builder, repo index
- `apps/graph-studio/` - static graph viewer
- `apps/research-hub/` - lightweight Python server and static UI
- `contexts/` and `rules/` - host-injected context and policy surfaces
- `graph/compiled/` - generated graph payloads
- `scripts/` - maintenance scripts
- `tests/` - Python `unittest` coverage

## Build, test, and validation commands
This repo is Python-first. In this checkout, Python commands that import `openresearch_core` need `packages/` on `PYTHONPATH` unless the package is installed another way.

### Recommended command prefix
- PowerShell: `$env:PYTHONPATH="packages"; <command>`
- bash/zsh: `PYTHONPATH=packages <command>`

### Build / generate
- Build graph artifacts: `python scripts/build_graph.py`
- Make target: `make graph`
- Generated outputs:
  - `graph/compiled/openresearch.graph.json`
  - `apps/graph-studio/graph.data.js`

### Tests
- Run all tests: `python -m unittest discover -s tests -p "test_*.py"`
- Make target: `make test`
- Run one test module: `python -m unittest tests.test_graph_builder`
- Run one test case: `python -m unittest tests.test_graph_builder.GraphBuilderTests.test_research_pi_and_pi_agent_exist`
- There is no dedicated repo script like `make test-one`.

### Validation
- Validate manifests: `python scripts/validate_manifests.py`
- There is no dedicated Make target for manifest validation today.

### Lint / formatting
- No root lint command is currently defined.
- No repo-level formatter or linter config was found at the root.
- Do not invent a formatter policy; follow the local style already present.

## Known command caveats
- `scripts/build_graph.py` imports `openresearch_core`, so it needs the package import path available.
- If tests fail with `ModuleNotFoundError: openresearch_core`, add `PYTHONPATH=packages`.
- The current graph tests execute but fail against current repo behavior; treat that as pre-existing unless your change is meant to fix them.
- `apps/graph-studio/` is static and can be viewed after generating `graph.data.js`.
- The README quick start also suggests `python -m http.server 8000` for serving static content.

## Required file-specific rules
- When adding or changing a skill, update both `skills/<skill-name>/SKILL.md` and `skills/<skill-name>/manifest.yaml`.
- When adding an agent profile, declare linked skills and delegated agents in frontmatter.
- When changing graph structure logic, verify both generated outputs still make sense.
- When changing manifests, run `python scripts/validate_manifests.py`.
- When changing graph builder or registry behavior, run the relevant `unittest` command.

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
- Follow the existing quote style within each file; single quotes are common, but some files intentionally mix styles.

### Imports
- Order Python imports as standard library, third-party packages, then local package imports.
- Keep imports explicit.
- Do not add unused imports.
- For local imports from the package, use `openresearch_core...` when code is intended to run with the package import path configured.

### Naming
- Use `snake_case` for Python functions, methods, variables, and module-level helpers.
- Use `PascalCase` for classes.
- Use `UPPER_CASE` for module-level constants.
- Use kebab-case for skill and agent directory/file identifiers such as `research-pi` and `principal-investigator`.
- Keep capability names namespaced with dot notation, for example `web.search`.

### Error handling
- Prefer explicit guards and narrow exception handling.
- Validate filesystem boundaries before reading or serving files.
- Raise or convert errors with clear user-facing meaning.
- In the hub server, follow the existing pattern of mapping `FileNotFoundError` -> 404 and `ValueError` -> 400.
- Never swallow exceptions silently.

### Data and schema conventions
- Preserve `ResearchPacket` as the canonical normalized research output shape.
- Keep serious outputs compatible with `ResearchPacket` fields and semantics.
- Preserve frontmatter structure in agent profile markdown.
- Preserve manifest structure in skill YAML.
- Do not move capability/provider concerns into `SKILL.md` prose if they belong in manifests or host config.

### JavaScript and frontend files
- The frontend here is plain JavaScript, HTML, and CSS, not TypeScript.
- Follow the local style in `apps/graph-studio/` and `apps/research-hub/static/`.
- Use semicolons in JS.
- Use 2-space indentation in JS and CSS.
- Prefer small DOM-oriented helper functions over framework-style abstractions.
- Keep browser logic defensive and user-visible on failure.

## Writing style for metadata files
Reflect the explicit rules in `rules/` when editing metadata.

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
- No `.cursor/rules/` directory or `.cursorrules` file was found in the repository root.
- No `.github/copilot-instructions.md` file was found.

## Practical guidance for coding agents
- Prefer minimal, local changes over broad refactors.
- Match the style of the file you are editing.
- Do not replace metadata-driven structure with hardcoded logic unless the existing design already does so.
- If you add a new skill, agent, rule, or context surface, keep the graphable relationships explicit.
- If you touch generated graph outputs, make sure the source code or metadata that produces them is also correct.
- If a command fails because of environment setup, document the setup requirement instead of pretending the command is broken.

## Before finishing a change
- Run manifest validation when manifests changed.
- Run the most specific affected Python test when Python logic changed.
- Rebuild the graph when graph-related code or metadata changed.
- Call out pre-existing test failures separately from failures introduced by your change.
