from __future__ import annotations

import json
from pathlib import Path

from openresearch_core.graph_builder import build_graph


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    graph = build_graph(repo_root)

    compiled_dir = repo_root / 'graph' / 'compiled'
    compiled_dir.mkdir(parents=True, exist_ok=True)
    graph_path = compiled_dir / 'openresearch.graph.json'
    graph_path.write_text(json.dumps(graph, indent=2), encoding='utf-8')

    studio_dir = repo_root / 'apps' / 'graph-studio'
    studio_dir.mkdir(parents=True, exist_ok=True)
    data_path = studio_dir / 'graph.data.js'
    data_path.write_text('window.OPENRESEARCH_GRAPH = ' + json.dumps(graph, indent=2) + ';\n', encoding='utf-8')

    print(f'[OK] wrote {graph_path}')
    print(f'[OK] wrote {data_path}')


if __name__ == '__main__':
    main()
