graph:
	python scripts/build_graph.py

test:
	python -m unittest discover -s tests -p 'test_*.py'
