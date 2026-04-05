# Research Hub

Research Hub is the local hosting layer for the scaffold.

It is intentionally small. It is there to make the repo inspectable:

- see the linked skill and agent graph
- browse files in `skills/`, `agents/`, `tools/`, `docs/`, and `graph/`
- search the repo
- inspect text-like files directly in the browser
- jump into the dedicated Graph Studio view

## Run it

```bash
python scripts/build_graph.py
python scripts/build_repo_index.py
python scripts/run_hub.py --repo-root . --port 8765
```

## Current API

- `/api/health`
- `/api/summary`
- `/api/graph`
- `/api/tree`
- `/api/search?q=...`
- `/api/file?path=...`

## Why keep it separate from the host

The host still owns execution, auth, scheduling, and heavy runtime behavior. The hub is a project surface, not the system brain.
