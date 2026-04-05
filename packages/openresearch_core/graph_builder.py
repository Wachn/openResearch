from __future__ import annotations

from pathlib import Path

from .repo_index import classify_path, list_repo_entries


def build_graph(repo_root: Path) -> dict:
    entries = list_repo_entries(repo_root)
    nodes = []
    edges = []
    by_type: dict[str, int] = {}

    root_id = 'repo:openresearch'
    nodes.append({'id': root_id, 'label': repo_root.name, 'type': 'repo'})
    by_type['repo'] = 1

    top_levels: dict[str, str] = {}
    for entry in entries:
        top = entry.path.split('/')[0]
        top_id = f'top:{top}'
        if top not in top_levels:
          top_levels[top] = top_id
          nodes.append({'id': top_id, 'label': top, 'type': 'module'})
          edges.append({'source': root_id, 'target': top_id, 'kind': 'contains'})
          by_type['module'] = by_type.get('module', 0) + 1

        node_type = classify_path(entry.path)
        by_type[node_type] = by_type.get(node_type, 0) + 1
        node_id = f'file:{entry.path}'
        nodes.append({
            'id': node_id,
            'label': Path(entry.path).name,
            'type': node_type,
            'path': entry.path,
            'size': entry.size,
        })
        edges.append({'source': top_id, 'target': node_id, 'kind': 'contains'})

        if Path(entry.path).name == 'SKILL.md':
            skill_name = Path(entry.path).parent.name
            skill_id = f'skill:{skill_name}'
            nodes.append({'id': skill_id, 'label': skill_name, 'type': 'skill'})
            edges.append({'source': top_id, 'target': skill_id, 'kind': 'declares'})
            edges.append({'source': skill_id, 'target': node_id, 'kind': 'defined_by'})
            by_type['skill'] = by_type.get('skill', 0) + 1

    return {
        'meta': {
            'graph_id': 'openresearch-graph',
            'repo_name': repo_root.name,
        },
        'nodes': nodes,
        'edges': edges,
        'by_type': by_type,
    }
