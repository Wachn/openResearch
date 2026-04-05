const svg = document.getElementById('canvas');
const details = document.getElementById('selection');
const metrics = document.getElementById('metrics');
const search = document.getElementById('search');
const chainSummary = document.getElementById('chain-summary');
const chainList = document.getElementById('chain-list');
const focusButton = document.getElementById('focus-chain');

const typeOrder = ['agent', 'skill', 'artifact', 'capability', 'context', 'app', 'doc', 'rule', 'package'];
const xByType = {
  agent: 170,
  skill: 470,
  artifact: 790,
  capability: 1110,
  context: 1430,
  app: 170,
  doc: 1110,
  rule: 1430,
  package: 790,
};

const state = {
  graph: null,
  researchPiId: 'skill:research-pi',
  focusChain: true,
  selectedNodeId: 'skill:research-pi',
  researchPiCalls: [],
  callTargetIds: new Set(),
  manualPositions: new Map(),
  drag: {
    nodeId: null,
    pointerId: null,
    startNodeX: 0,
    startNodeY: 0,
    startPointerX: 0,
    startPointerY: 0,
    moved: false,
  },
};

async function loadGraph() {
  let rawGraph = null;

  if (location.pathname.startsWith('/graph-studio/')) {
    try {
      const response = await fetch('/api/graph');
      if (response.ok) {
        rawGraph = await response.json();
      }
    } catch {
      rawGraph = null;
    }
  }

  if (!rawGraph) {
    rawGraph = window.OPENRESEARCH_GRAPH;
  }

  const graph = normalizeGraph(rawGraph);
  const calls = await loadResearchPiCalls();
  addSyntheticCallEdges(graph, calls);
  state.graph = graph;
  state.researchPiCalls = calls;
  state.callTargetIds = new Set(calls.map(name => `skill:${name}`));
}

function normalizeGraph(rawGraph) {
  const nodes = (rawGraph?.nodes || []).map(node => ({
    ...node,
    kind: node.kind || node.type || 'file',
    meta: node.meta || {},
  }));
  const edges = (rawGraph?.edges || []).map(edge => ({
    ...edge,
    kind: edge.kind || 'links',
    meta: edge.meta || {},
  }));
  const byType = rawGraph?.by_type || rawGraph?.byType || countBy(nodes, 'kind');

  return {
    meta: rawGraph?.meta || {},
    nodes,
    edges,
    byType,
  };
}

function countBy(items, key) {
  const counts = {};
  items.forEach(item => {
    counts[item[key]] = (counts[item[key]] || 0) + 1;
  });
  return counts;
}

async function loadResearchPiCalls() {
  const sources = [];

  if (location.pathname.startsWith('/graph-studio/')) {
    sources.push('/api/file?path=skills/research-pi/manifest.yaml');
  }
  sources.push('../../skills/research-pi/manifest.yaml');

  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (!response.ok) {
        continue;
      }
      const text = source.startsWith('/api/file')
        ? (await response.json()).content || ''
        : await response.text();
      const calls = parseCallsFromManifest(text);
      if (calls.length) {
        return calls;
      }
    } catch {
    }
  }

  return [];
}

function parseCallsFromManifest(text) {
  const match = text.match(/links:\s*\n\s*calls:\s*\n((?:\s*-\s*[^\n]+\n)+)/m);
  if (!match) {
    return [];
  }

  return match[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim())
    .filter(Boolean);
}

function addSyntheticCallEdges(graph, calls) {
  const existing = new Set(graph.edges.map(edge => `${edge.source}|${edge.target}|${edge.kind}`));

  calls.forEach(name => {
    const target = `skill:${name}`;
    const key = `${state.researchPiId}|${target}|calls`;
    if (!graph.nodes.some(node => node.id === target) || existing.has(key)) {
      return;
    }
    graph.edges.push({
      source: state.researchPiId,
      target,
      kind: 'calls',
      meta: { synthetic: true },
    });
  });
}

function drawMetrics() {
  metrics.innerHTML = '';
  const rows = [
    ['skills', state.graph.byType.skill || 0],
    ['edges', state.graph.edges.length],
    ['research-pi calls', state.researchPiCalls.length],
  ];

  rows.forEach(([label, value]) => {
    const div = document.createElement('div');
    div.className = 'metric';
    div.textContent = `${label}: ${value}`;
    metrics.appendChild(div);
  });
}

function layoutNodes(nodes) {
  const grouped = {};
  typeOrder.forEach(kind => {
    grouped[kind] = [];
  });

  nodes.forEach(node => {
    if (!grouped[node.kind]) {
      grouped[node.kind] = [];
    }
    grouped[node.kind].push(node);
  });

  const orderedKinds = [...typeOrder, ...Object.keys(grouped).filter(kind => !typeOrder.includes(kind))];
  orderedKinds.forEach((kind, kindIndex) => {
    grouped[kind].sort(compareNodes);
    grouped[kind].forEach((node, index) => {
      node.x = xByType[kind] || (1470 + Math.max(0, kindIndex - typeOrder.length) * 320);
      node.y = 100 + index * 98;
    });
  });

  const researchPi = nodes.find(node => node.id === state.researchPiId);
  if (researchPi) {
    researchPi.x = 470;
    researchPi.y = 180;
  }

  state.researchPiCalls.forEach((name, index) => {
    const target = nodes.find(node => node.id === `skill:${name}`);
    if (!target) {
      return;
    }
    target.x = 870;
    target.y = 120 + index * 84;
  });

  nodes.forEach(node => {
    const manual = state.manualPositions.get(node.id);
    if (manual) {
      node.x = manual.x;
      node.y = manual.y;
    }
  });
}

function compareNodes(a, b) {
  if (a.id === state.researchPiId) return -1;
  if (b.id === state.researchPiId) return 1;

  const aCall = state.callTargetIds.has(a.id);
  const bCall = state.callTargetIds.has(b.id);
  if (aCall && !bCall) return -1;
  if (!aCall && bCall) return 1;

  return a.label.localeCompare(b.label);
}

function clearSVG() {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
}

function nodeMap() {
  const map = new Map();
  state.graph.nodes.forEach(node => {
    map.set(node.id, node);
  });
  return map;
}

function edgePath(source, target) {
  const sx = source.x + 108;
  const sy = source.y;
  const tx = target.x - 108;
  const ty = target.y;
  const mid = (tx - sx) * 0.45;
  return `M ${sx} ${sy} C ${sx + mid} ${sy}, ${tx - mid} ${ty}, ${tx} ${ty}`;
}

function isFocusNode(nodeId) {
  return nodeId === state.researchPiId || state.callTargetIds.has(nodeId);
}

function visibleNodeIds() {
  const query = search.value.trim().toLowerCase();
  const ids = new Set();

  state.graph.nodes.forEach(node => {
    const matchesQuery = !query || node.label.toLowerCase().includes(query) || node.id.toLowerCase().includes(query);
    if (!matchesQuery) {
      return;
    }
    if (!state.focusChain || isFocusNode(node.id)) {
      ids.add(node.id);
    }
  });

  if (state.selectedNodeId) {
    ids.add(state.selectedNodeId);
    state.graph.edges.forEach(edge => {
      if (edge.source === state.selectedNodeId || edge.target === state.selectedNodeId) {
        ids.add(edge.source);
        ids.add(edge.target);
      }
    });
  }

  if (state.focusChain) {
    ids.add(state.researchPiId);
    state.callTargetIds.forEach(id => {
      ids.add(id);
    });
  }

  return ids;
}

function renderChainPanel() {
  const calls = state.researchPiCalls;
  chainSummary.textContent = calls.length
    ? `research-pi routes into ${calls.length} atomic skills. Drag nodes to compare paths and scroll the canvas for the full chain.`
    : 'No routed calls found in the research-pi manifest.';
  chainList.innerHTML = '';

  calls.forEach(name => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chain-item';
    button.textContent = name;
    button.addEventListener('click', () => {
      state.selectedNodeId = `skill:${name}`;
      render();
    });
    chainList.appendChild(button);
  });
}

function syncCanvasSize(visibleIds) {
  const visibleNodes = state.graph.nodes.filter(node => visibleIds.has(node.id));
  if (!visibleNodes.length) {
    svg.setAttribute('viewBox', '0 0 1600 1200');
    svg.style.width = '1600px';
    svg.style.height = '1200px';
    return;
  }

  const paddingX = 220;
  const paddingY = 180;
  const maxX = Math.max(...visibleNodes.map(node => node.x + 150), 1600 - paddingX);
  const maxY = Math.max(...visibleNodes.map(node => node.y + 90), 1200 - paddingY);
  const width = Math.max(1600, maxX + paddingX);
  const height = Math.max(1200, maxY + paddingY);

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;
}

function render() {
  clearSVG();
  layoutNodes(state.graph.nodes);
  renderChainPanel();
  const map = nodeMap();
  const visibleIds = visibleNodeIds();
  syncCanvasSize(visibleIds);

  state.graph.edges.forEach(edge => {
    if (!visibleIds.has(edge.source) || !visibleIds.has(edge.target)) {
      return;
    }
    const source = map.get(edge.source);
    const target = map.get(edge.target);
    if (!source || !target) {
      return;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const active = edge.source === state.selectedNodeId || edge.target === state.selectedNodeId;
    const focus = edge.kind === 'calls' && edge.source === state.researchPiId;
    path.setAttribute('d', edgePath(source, target));
    path.setAttribute('class', `edge ${edge.kind}${active ? ' active' : ''}${focus ? ' focus' : ''}`);
    svg.appendChild(path);
  });

  state.graph.nodes.forEach(node => {
    if (!visibleIds.has(node.id)) {
      return;
    }
    const isSelected = node.id === state.selectedNodeId;
    const isResearchPi = node.id === state.researchPiId;
    const isCall = state.callTargetIds.has(node.id);
    const isDragging = state.drag.nodeId === node.id;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `node${isSelected ? ' selected' : ''}${isResearchPi ? ' research-pi' : ''}${isCall ? ' chain-node' : ''}${isDragging ? ' dragging' : ''}`);
    group.style.cursor = isDragging ? 'grabbing' : 'grab';
    group.addEventListener('pointerdown', event => startNodeDrag(event, node.id));

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(node.x - 108));
    rect.setAttribute('y', String(node.y - 32));
    rect.setAttribute('width', '216');
    rect.setAttribute('height', '64');
    rect.setAttribute('fill', nodeFill(node));

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', String(node.x - 90));
    title.setAttribute('y', String(node.y - 4));
    title.setAttribute('class', 'title');
    title.textContent = node.label;

    const kind = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    kind.setAttribute('x', String(node.x - 90));
    kind.setAttribute('y', String(node.y + 18));
    kind.setAttribute('class', 'kind');
    kind.textContent = isResearchPi ? 'root orchestrator' : node.kind;

    group.appendChild(rect);
    group.appendChild(title);
    group.appendChild(kind);
    svg.appendChild(group);
  });

  updateSelection();
}

function nodeFill(node) {
  if (node.id === state.researchPiId) {
    return '#0f766e';
  }
  if (state.callTargetIds.has(node.id)) {
    return '#1d4ed8';
  }
  const colors = {
    skill: '#475569',
    capability: '#7c3aed',
    artifact: '#c2410c',
    context: '#334155',
    agent: '#be185d',
  };
  return colors[node.kind] || '#64748b';
}

function getGraphPoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) {
    return { x: 0, y: 0 };
  }
  const transformed = point.matrixTransform(matrix.inverse());
  return { x: transformed.x, y: transformed.y };
}

function startNodeDrag(event, nodeId) {
  event.preventDefault();
  const node = state.graph.nodes.find(item => item.id === nodeId);
  if (!node) {
    return;
  }
  const pointer = getGraphPoint(event);
  state.drag = {
    nodeId,
    pointerId: event.pointerId,
    startNodeX: node.x,
    startNodeY: node.y,
    startPointerX: pointer.x,
    startPointerY: pointer.y,
    moved: false,
  };
  if (svg.setPointerCapture) {
    svg.setPointerCapture(event.pointerId);
  }
}

function moveNodeDrag(event) {
  if (!state.drag.nodeId) {
    return;
  }
  if (state.drag.pointerId !== null && event.pointerId !== state.drag.pointerId) {
    return;
  }

  const pointer = getGraphPoint(event);
  const nextX = state.drag.startNodeX + (pointer.x - state.drag.startPointerX);
  const nextY = state.drag.startNodeY + (pointer.y - state.drag.startPointerY);
  const movedEnough = Math.abs(nextX - state.drag.startNodeX) > 4 || Math.abs(nextY - state.drag.startNodeY) > 4;
  state.drag.moved = state.drag.moved || movedEnough;

  state.manualPositions.set(state.drag.nodeId, {
    x: Math.max(130, nextX),
    y: Math.max(90, nextY),
  });

  if (state.drag.moved) {
    render();
  }
}

function endNodeDrag(event) {
  if (!state.drag.nodeId) {
    return;
  }
  if (state.drag.pointerId !== null && event.pointerId !== state.drag.pointerId) {
    return;
  }

  const draggedNodeId = state.drag.nodeId;
  const wasDrag = state.drag.moved;
  if (svg.releasePointerCapture && state.drag.pointerId !== null) {
    svg.releasePointerCapture(state.drag.pointerId);
  }
  state.drag = {
    nodeId: null,
    pointerId: null,
    startNodeX: 0,
    startNodeY: 0,
    startPointerX: 0,
    startPointerY: 0,
    moved: false,
  };

  if (!wasDrag) {
    state.selectedNodeId = draggedNodeId;
  }
  render();
}

function updateSelection() {
  const node = state.graph.nodes.find(item => item.id === state.selectedNodeId);
  if (!node) {
    details.textContent = 'Select a node to inspect its links.';
    return;
  }

  const links = state.graph.edges
    .filter(edge => edge.source === node.id || edge.target === node.id)
    .map(edge => `${edge.kind}: ${edge.source} -> ${edge.target}${edge.meta.synthetic ? ' (from manifest)' : ''}`)
    .join('\n');

  details.textContent = [
    `label: ${node.label}`,
    `id: ${node.id}`,
    `kind: ${node.kind}`,
    `position: ${Math.round(node.x)}, ${Math.round(node.y)}`,
    '',
    'links:',
    links || 'none',
  ].join('\n');
}

focusButton.addEventListener('click', () => {
  state.focusChain = !state.focusChain;
  focusButton.classList.toggle('is-active', state.focusChain);
  focusButton.textContent = state.focusChain ? 'Focus `research-pi` chain' : 'Show full graph';
  render();
});

search.addEventListener('input', render);
svg.addEventListener('pointermove', moveNodeDrag);
svg.addEventListener('pointerup', endNodeDrag);
svg.addEventListener('pointerleave', event => {
  if (state.drag.nodeId) {
    endNodeDrag(event);
  }
});

loadGraph()
  .then(() => {
    drawMetrics();
    render();
  })
  .catch(error => {
    chainSummary.textContent = 'Graph Studio failed to load.';
    details.textContent = String(error.message || error);
  });
