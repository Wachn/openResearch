from __future__ import annotations

import argparse
import json
import mimetypes
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

import sys

REPO_ROOT_FOR_IMPORT = Path(__file__).resolve().parents[2]
PACKAGES_ROOT = REPO_ROOT_FOR_IMPORT / 'packages'
if str(PACKAGES_ROOT) not in sys.path:
    sys.path.insert(0, str(PACKAGES_ROOT))

from openresearch_core.graph_builder import build_graph
from openresearch_core.repo_index import build_tree, read_text_file, resolve_repo_path, search_repo, summarize_repo, summarize_workspace


class ResearchHubHandler(SimpleHTTPRequestHandler):
    repo_root: Path
    static_root: Path

    def translate_path(self, path: str) -> str:
        parsed = urlparse(path)
        rel = parsed.path.lstrip('/') or 'index.html'
        target = (self.static_root / rel).resolve()
        if self.static_root.resolve() not in target.parents and target != self.static_root.resolve():
            return str(self.static_root / 'index.html')
        return str(target)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == '/preview':
            query = parse_qs(parsed.query)
            path = unquote(query.get('path', [''])[0])
            self.serve_workspace_preview(path)
            return
        if parsed.path.startswith('/api/'):
            self.handle_api(parsed)
            return
        if parsed.path == '/graph-studio':
            self.send_response(HTTPStatus.FOUND)
            self.send_header('Location', '/graph-studio/')
            self.end_headers()
            return
        if parsed.path.startswith('/graph-studio/'):
            self.serve_from_dir(self.repo_root / 'apps' / 'graph-studio', parsed.path.removeprefix('/graph-studio/'))
            return
        super().do_GET()

    def serve_from_dir(self, root: Path, rel: str) -> None:
        rel = rel or 'index.html'
        target = (root / rel).resolve()
        if root.resolve() not in target.parents and target != root.resolve():
            self.send_error(HTTPStatus.BAD_REQUEST, 'invalid path')
            return
        if not target.exists() or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, 'not found')
            return
        content_type = mimetypes.guess_type(str(target))[0] or 'application/octet-stream'
        data = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def serve_workspace_preview(self, rel_path: str) -> None:
        rel_path = rel_path.lstrip('/')
        if not rel_path.startswith('research-workspace/'):
            self.send_error(HTTPStatus.BAD_REQUEST, 'preview path must stay inside research-workspace')
            return
        target = resolve_repo_path(self.repo_root, rel_path)
        if not target.exists() or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, 'not found')
            return
        content_type = mimetypes.guess_type(str(target))[0] or 'application/octet-stream'
        data = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def handle_api(self, parsed) -> None:
        try:
            if parsed.path == '/api/health':
                self.send_json({'ok': True, 'repo': self.repo_root.name})
            elif parsed.path == '/api/summary':
                self.send_json(summarize_repo(self.repo_root))
            elif parsed.path == '/api/graph':
                self.send_json(build_graph(self.repo_root))
            elif parsed.path == '/api/tree':
                self.send_json(build_tree(self.repo_root))
            elif parsed.path == '/api/workspace/tree':
                self.send_json(build_tree(self.repo_root, 'research-workspace'))
            elif parsed.path == '/api/workspace/summary':
                self.send_json(summarize_workspace(self.repo_root))
            elif parsed.path == '/api/file':
                query = parse_qs(parsed.query)
                path = unquote(query.get('path', [''])[0])
                self.send_json(read_text_file(self.repo_root, path))
            elif parsed.path == '/api/search':
                query = parse_qs(parsed.query)
                q = query.get('q', [''])[0]
                self.send_json({'query': q, 'results': search_repo(self.repo_root, q)})
            else:
                self.send_error(HTTPStatus.NOT_FOUND, 'unknown api route')
        except FileNotFoundError as exc:
            self.send_json({'error': f'file not found: {exc}'}, status=HTTPStatus.NOT_FOUND)
        except ValueError as exc:
            self.send_json({'error': str(exc)}, status=HTTPStatus.BAD_REQUEST)

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def build_handler(repo_root: Path, static_root: Path):
    class _BoundHandler(ResearchHubHandler):
        pass

    _BoundHandler.repo_root = repo_root
    _BoundHandler.static_root = static_root
    return _BoundHandler


def main() -> None:
    parser = argparse.ArgumentParser(description='Run the openResearch Hub dev server')
    parser.add_argument('--repo-root', default='.', help='Path to the openResearch repo root')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    static_root = repo_root / 'apps' / 'research-hub' / 'static'
    handler_cls = build_handler(repo_root, static_root)
    server = ThreadingHTTPServer((args.host, args.port), handler_cls)
    print(f'openResearch Hub serving {repo_root} at http://{args.host}:{args.port}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
