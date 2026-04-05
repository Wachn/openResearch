from __future__ import annotations

from pathlib import Path

import yaml


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    errors: list[str] = []
    for manifest in sorted((repo_root / 'skills').glob('*/manifest.yaml')):
        data = yaml.safe_load(manifest.read_text(encoding='utf-8')) or {}
        for field in ['name', 'kind', 'links', 'capabilities', 'artifacts']:
            if field not in data:
                errors.append(f'{manifest}: missing {field}')
    if errors:
        print('\n'.join(errors))
        return 1
    print('[OK] manifests look structurally valid')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
