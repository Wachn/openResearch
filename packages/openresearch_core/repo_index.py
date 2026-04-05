from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

TEXT_EXTENSIONS = {
    '.md', '.mdc', '.txt', '.json', '.jsonc', '.yaml', '.yml', '.toml', '.py', '.js', '.css', '.html', '.schema', '.schema.json'
}

SKIP_DIRS = {'.git', '.pytest_cache', '__pycache__', '.mypy_cache', '.venv', 'node_modules'}


@dataclass(slots=True)
class RepoEntry:
    path: str
    kind: str
    size: int


CATEGORY_PREFIXES = [
    ('skills/', 'skill'),
    ('agents/', 'agent'),
    ('tools/', 'tool'),
    ('apps/', 'app'),
    ('docs/', 'doc'),
    ('graph/', 'graph'),
    ('contexts/', 'context'),
    ('rules/', 'rule'),
    ('schemas/', 'schema'),
    ('examples/', 'example'),
    ('tests/', 'test'),
    ('packages/', 'package'),
]


def classify_path(rel_path: str) -> str:
    for prefix, kind in CATEGORY_PREFIXES:
        if rel_path.startswith(prefix):
            return kind
    return 'file'


def iter_repo_files(repo_root: Path) -> Iterable[Path]:
    for path in repo_root.rglob('*'):
        if path.is_dir():
            if path.name in SKIP_DIRS:
                continue
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path


def build_tree(repo_root: Path) -> dict:
    root = {'name': repo_root.name, 'path': '.', 'kind': 'dir', 'children': []}
    path_map: dict[str, dict] = {'.': root}

    for file_path in sorted(iter_repo_files(repo_root)):
        rel = file_path.relative_to(repo_root).as_posix()
        current_parent = root
        parent_key = '.'
        parts = rel.split('/')
        for idx, part in enumerate(parts):
            is_last = idx == len(parts) - 1
            child_path = part if parent_key == '.' else f'{parent_key}/{part}'
            existing = path_map.get(child_path)
            if existing is None:
                node = {
                    'name': part,
                    'path': child_path,
                    'kind': 'file' if is_last else 'dir',
                }
                if is_last:
                    node['category'] = classify_path(rel)
                    node['size'] = file_path.stat().st_size
                else:
                    node['children'] = []
                current_parent['children'].append(node)
                path_map[child_path] = node
                existing = node
            current_parent = existing
            parent_key = child_path
    return root


def list_repo_entries(repo_root: Path) -> list[RepoEntry]:
    entries: list[RepoEntry] = []
    for file_path in sorted(iter_repo_files(repo_root)):
        rel = file_path.relative_to(repo_root).as_posix()
        entries.append(RepoEntry(path=rel, kind=classify_path(rel), size=file_path.stat().st_size))
    return entries


def search_repo(repo_root: Path, query: str, limit: int = 50) -> list[dict]:
    query = query.strip().lower()
    if not query:
        return []

    results: list[dict] = []
    for entry in list_repo_entries(repo_root):
        score = 0
        lower = entry.path.lower()
        if query in lower:
            score += 5
        if Path(lower).name.startswith(query):
            score += 4
        if f'/{query}' in lower:
            score += 2
        if score == 0:
            continue
        results.append({'path': entry.path, 'kind': entry.kind, 'size': entry.size, 'score': score})

    results.sort(key=lambda item: (-item['score'], item['path']))
    return results[:limit]


def read_text_file(repo_root: Path, rel_path: str, max_chars: int = 200_000) -> dict:
    rel_path = rel_path.lstrip('/')
    file_path = (repo_root / rel_path).resolve()
    if repo_root.resolve() not in file_path.parents and file_path != repo_root.resolve():
        raise ValueError('Path escapes repo root')
    if not file_path.exists() or not file_path.is_file():
        raise FileNotFoundError(rel_path)

    ext = file_path.suffix.lower()
    if ext not in TEXT_EXTENSIONS and file_path.name not in {'AGENTS.md', 'SKILL.md', 'Makefile', '.env.example'}:
        raise ValueError('Only text-like files are supported in the hub viewer')

    text = file_path.read_text(encoding='utf-8', errors='replace')
    truncated = len(text) > max_chars
    if truncated:
        text = text[:max_chars]
    return {
        'path': rel_path,
        'kind': classify_path(rel_path),
        'content': text,
        'truncated': truncated,
    }


def summarize_repo(repo_root: Path) -> dict:
    entries = list_repo_entries(repo_root)
    by_kind: dict[str, int] = {}
    for entry in entries:
        by_kind[entry.kind] = by_kind.get(entry.kind, 0) + 1

    return {
        'repo_name': repo_root.name,
        'file_count': len(entries),
        'by_kind': by_kind,
        'top_level': sorted({p.path.split('/')[0] for p in entries}),
    }


def write_repo_index(repo_root: Path, out_path: Path) -> None:
    payload = {
        'summary': summarize_repo(repo_root),
        'tree': build_tree(repo_root),
        'entries': [{'path': entry.path, 'kind': entry.kind, 'size': entry.size} for entry in list_repo_entries(repo_root)],
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
