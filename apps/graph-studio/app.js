    const graph = window.OPENRESEARCH_GRAPH;
    const svg = document.getElementById('canvas');
    const details = document.getElementById('selection');
    const metrics = document.getElementById('metrics');
    const search = document.getElementById('search');
    const filters = Array.from(document.querySelectorAll('.kind-filter'));

    const typeOrder = ['agent', 'skill', 'artifact', 'capability', 'context'];
    const xByType = { agent: 150, skill: 470, artifact: 790, capability: 1110, context: 1430 };

    function selectedKinds() {
      return new Set(filters.filter(el => el.checked).map(el => el.value));
    }

    function layoutNodes(nodes) {
      const grouped = {};
      typeOrder.forEach(kind => grouped[kind] = []);
      nodes.forEach(node => {
        if (!grouped[node.kind]) grouped[node.kind] = [];
        grouped[node.kind].push(node);
      });
      typeOrder.forEach(kind => {
        grouped[kind].sort((a, b) => a.label.localeCompare(b.label));
        grouped[kind].forEach((node, index) => {
          node.x = xByType[kind] || 1500;
          node.y = 80 + index * 95;
        });
      });
    }

    function drawMetrics() {
      metrics.innerHTML = '';
      const parts = [
        ['skills', graph.meta.skill_count],
        ['agents', graph.meta.agent_count],
        ['capabilities', graph.meta.capability_count],
        ['artifacts', graph.meta.artifact_count],
        ['context', graph.meta.context_count],
      ];
      parts.forEach(([label, value]) => {
        const div = document.createElement('div');
        div.className = 'metric';
        div.textContent = `${label}: ${value}`;
        metrics.appendChild(div);
      });
    }

    function clearSVG() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
    }

    function nodeMap() {
      const map = new Map();
      graph.nodes.forEach(node => map.set(node.id, node));
      return map;
    }

    function edgePath(source, target) {
      const sx = source.x + 105;
      const sy = source.y;
      const tx = target.x - 105;
      const ty = target.y;
      const cx1 = sx + 80;
      const cx2 = tx - 80;
      return `M ${sx} ${sy} C ${cx1} ${sy}, ${cx2} ${ty}, ${tx} ${ty}`;
    }

    function render() {
      clearSVG();
      layoutNodes(graph.nodes);
      const allowedKinds = selectedKinds();
      const q = search.value.trim().toLowerCase();
      const map = nodeMap();

      const visibleNodes = new Set(
        graph.nodes
          .filter(node => allowedKinds.has(node.kind))
          .filter(node => !q || node.label.toLowerCase().includes(q))
          .map(node => node.id)
      );

      graph.edges.forEach(edge => {
        if (!visibleNodes.has(edge.source) || !visibleNodes.has(edge.target)) return;
        const source = map.get(edge.source);
        const target = map.get(edge.target);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', edgePath(source, target));
        path.setAttribute('class', `edge ${edge.kind}`);
        svg.appendChild(path);
      });

      graph.nodes.forEach(node => {
        if (!visibleNodes.has(node.id)) return;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node');
        g.style.cursor = 'pointer';
        g.addEventListener('click', () => selectNode(node, g));

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(node.x - 100));
        rect.setAttribute('y', String(node.y - 30));
        rect.setAttribute('width', '200');
        rect.setAttribute('height', '60');
        rect.setAttribute('fill', node.meta.color || '#64748b');

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', String(node.x - 86));
        title.setAttribute('y', String(node.y - 2));
        title.setAttribute('class', 'title');
        title.textContent = node.label;

        const kind = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        kind.setAttribute('x', String(node.x - 86));
        kind.setAttribute('y', String(node.y + 18));
        kind.setAttribute('class', 'kind');
        kind.textContent = node.kind;

        g.appendChild(rect);
        g.appendChild(title);
        g.appendChild(kind);
        svg.appendChild(g);
      });
    }

    function selectNode(node, groupEl) {
      document.querySelectorAll('.node.selected').forEach(el => el.classList.remove('selected'));
      groupEl.classList.add('selected');
      const linked = graph.edges
        .filter(edge => edge.source === node.id || edge.target === node.id)
        .map(edge => `${edge.kind}: ${edge.source} -> ${edge.target}`)
        .join('
');
      details.textContent = [
        `label: ${node.label}`,
        `id: ${node.id}`,
        `kind: ${node.kind}`,
        '',
        'meta:',
        JSON.stringify(node.meta || {}, null, 2),
        '',
        'links:',
        linked || 'none'
      ].join('
');
    }

    filters.forEach(el => el.addEventListener('change', render));
    search.addEventListener('input', render);

    drawMetrics();
    render();
