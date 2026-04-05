from __future__ import annotations

from pathlib import Path
import unittest

from openresearch_core.graph_builder import build_graph


class GraphBuilderTests(unittest.TestCase):
    def test_research_pi_and_pi_agent_exist(self) -> None:
        repo_root = Path(__file__).resolve().parents[1]
        graph = build_graph(repo_root)
        node_ids = {node['id'] for node in graph['nodes']}
        self.assertIn('skill:research-pi', node_ids)
        self.assertIn('agent:principal-investigator', node_ids)

    def test_research_pi_calls_report_packager(self) -> None:
        repo_root = Path(__file__).resolve().parents[1]
        graph = build_graph(repo_root)
        self.assertIn(
            {
                'source': 'skill:research-pi',
                'target': 'skill:report-packager',
                'kind': 'calls',
                'meta': {},
            },
            graph['edges'],
        )


if __name__ == '__main__':
    unittest.main()
