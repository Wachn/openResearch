---
name: research-hub-and-graph
description: build and extend the openResearch research hub and graph studio as a dynamic workspace for generated reports, literature notes, repo captures, and graph review. use when the host needs precise implementation instructions rather than static mockups.
---

# Research Hub and Graph

Use this skill to implement or extend the openResearch hub and graph studio in a portable, metadata-driven way.

## Trigger Boundary

- Use this skill when the task is about the hub UI, graph-studio UI, graph payload review, workspace browsing, generated reports, literature-note review, or graph-node interaction.
- Do not use this skill for generic topic research, paper discovery, or report writing unless the task is specifically about the hub or graph experience.

## Mission

Build a one-stop review surface where a host can:

1. inspect graph nodes and edges clearly
2. navigate generated reports and compiled literature from one place
3. review notes, packaged outputs, PDFs, repo captures, and storage folders inside `research-workspace/`
4. keep the implementation portable so the same skill can guide another host or code agent later

## Non-Negotiable Rules

- Keep the hub dynamic. Do not leave workspace areas as hardcoded demo cards when live repo data is available.
- Keep the graph readable. Prefer explicit node affordances, clear focus behavior, and interaction that helps the user trace relationships.
- Preserve the lightweight stack: plain Python backend plus plain HTML, CSS, and JavaScript frontend.
- Keep routing and relationships metadata-driven. If a relationship already exists in manifests or generated payloads, surface it rather than duplicating logic elsewhere.
- Store generated review artifacts under `research-workspace/`, not scattered ad hoc through the repo.

## Implementation Flow

### 1. Inspect current surfaces

- Read `apps/research-hub/server.py` to understand the existing API routes.
- Read `packages/openresearch_core/repo_index.py` to understand repo listing, file reads, and safe path handling.
- Read `apps/research-hub/static/` and `apps/graph-studio/` before changing frontend behavior.
- Read skill manifests when the graph presentation depends on metadata-defined relationships.

### 2. Extend the data layer first

- Add or extend backend endpoints so the hub can enumerate `research-workspace/` dynamically.
- Reuse safe path resolution and text/binary preview rules from the repo index layer.
- Return summary payloads that are easy for the frontend to render without embedding fake counts in JavaScript.

### 3. Extend the hub UI

- Render workspace sections from live API data.
- Make generated assets openable from the hub viewer.
- Keep three practical buckets visible:
  - compiled reports
  - literature notes
  - source libraries such as PDFs, repo captures, and databases

### 4. Extend the graph UI

- Keep graph nodes draggable when the user needs to manually compare or declutter the view.
- Ensure lower or farther nodes remain reachable through scrolling or other canvas navigation.
- Preserve click-to-select details and relationship inspection.
- Handle unknown or newly added node kinds gracefully instead of assuming a fixed type list forever.

### 5. Rebuild and verify

- If manifests change, regenerate graph outputs so the new skill becomes visible in graph studio.
- Verify both the backend API and the browser UI.

## Research Hub Requirements

The hub should act like a review workspace, not only a repo browser.

### Required workspace behavior

- Show the `research-workspace/` root clearly.
- Summarize how many generated assets exist and how large the workspace is.
- Group items by review function, not only by raw folder path.
- Let the user open generated markdown, html, json, yaml, and other text-like outputs in the file viewer.
- For binary assets such as PDFs or SQLite files, show metadata and an explicit preview-unavailable message instead of a hard failure.

### Recommended workspace folders

- `research-workspace/reports/`
- `research-workspace/notes/`
- `research-workspace/pdfs/`
- `research-workspace/repos/`
- `research-workspace/db/`

Keep the folder structure predictable so other hosts can import this skill and immediately know where generated assets belong.

## Graph Studio Requirements

### Required node behavior

- Node drag must update the rendered graph state without breaking selection.
- The selected node should still expose paths, labels, kinds, and related edges.
- The canvas must remain navigable when the graph grows downward or sideways.

### Required rendering behavior

- Graph rendering must tolerate new node types and new skill nodes.
- If the payload lacks a display-friendly edge but the relationship is clearly encoded in repo metadata, it is acceptable to synthesize a visual-only edge as long as the UI labels it as derived or manifest-backed.
- Do not regress into a raw JSON-only graph page.

## Dynamic Workspace Data Contract

When you add a workspace summary API, shape it so the frontend can render it directly.

Recommended fields:

- `root`
- `exists`
- `file_count`
- `total_size`
- `stats[]` with `label`, `value`, and `tone`
- `sections[]` with `key`, `label`, `tone`, `description`, `count`, and `items[]`
- `storage[]` with folder path, label, count, and total size
- `featured` item for the primary review card when any artifact exists

Each workspace item should include:

- `path`
- `title`
- `kind`
- `size`
- `extension`

## Portability Rules

- Keep this skill host-portable. Do not mention provider credentials or environment secrets.
- Refer to repo paths and capabilities, not one proprietary agent runtime.
- Assume another host may import this skill and use it to recreate the same hub and graph experience elsewhere.

## Verification Checklist

Before closing a hub or graph implementation task:

1. run diagnostics on changed Python and JavaScript files
2. verify the hub can load live workspace data
3. verify the graph page still loads without console errors
4. verify dragging or scrolling behavior in graph studio when applicable
5. verify generated assets can be opened or at least reviewed safely from the hub
6. rebuild graph data when manifests changed

## Example Templates

This skill includes starter templates under `skills/research-hub-and-graph/examples/` for:

- a compiled report artifact
- a literature note artifact
- a workspace index payload

Use them as implementation examples, not as fixed final UI content.
