const state = {
  summary: null,
  graph: null,
  tree: null,
  currentPath: '',
};

const el = {
  metrics: document.getElementById('metrics'),
  healthStatus: document.getElementById('health-status'),
  repoName: document.getElementById('repo-name'),
  graphCount: document.getElementById('graph-count'),
  search: document.getElementById('search'),
  searchEmpty: document.getElementById('search-empty'),
  searchResults: document.getElementById('search-results'),
  tree: document.getElementById('tree'),
  summaryCards: document.getElementById('summary-cards'),
  graphMeta: document.getElementById('graph-meta'),
  topLevelCount: document.getElementById('top-level-count'),
  topLevelTags: document.getElementById('top-level-tags'),
  fileMeta: document.getElementById('file-meta'),
  fileContent: document.getElementById('file-content'),
  copyPath: document.getElementById('copy-path'),
  refreshAll: document.getElementById('refresh-all'),
  collapseTree: document.getElementById('collapse-tree'),
};

async function api(path) {
  const response = await fetch(path);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function sizeLabel(bytes) {
  if (!bytes && bytes !== 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function setHealth(ok, repo = '') {
  el.healthStatus.textContent = ok ? 'Ready' : 'Unavailable';
  el.healthStatus.className = ok ? 'status-ok' : 'status-bad';
  if (repo) el.repoName.textContent = repo;
}

function renderMetrics(summary) {
  const items = [
    { label: 'Files indexed', value: formatNumber(summary.file_count), caption: 'Searchable text-like and repo files' },
    { label: 'Kinds tracked', value: formatNumber(Object.keys(summary.by_kind || {}).length), caption: 'Skills, docs, apps, packages and more' },
    { label: 'Top-level roots', value: formatNumber((summary.top_level || []).length), caption: 'Primary repo modules' },
  ];
  el.metrics.innerHTML = items.map(item => `
    <article class="metric-card">
      <div class="label">${item.label}</div>
      <div class="value">${item.value}</div>
      <div class="caption">${item.caption}</div>
    </article>
  `).join('');
}

function renderSummary(summary) {
  const kinds = Object.entries(summary.by_kind || {}).sort((a, b) => b[1] - a[1]);
  el.summaryCards.innerHTML = kinds.map(([kind, count]) => `
    <div class="summary-card">
      <span class="count">${formatNumber(count)}</span>
      <span class="kind">${kind}</span>
    </div>
  `).join('') || '<div class="muted">No indexed files yet.</div>';

  const topLevel = summary.top_level || [];
  el.topLevelCount.textContent = `${topLevel.length} roots`;
  el.topLevelTags.innerHTML = topLevel.map(item => `<span class="tag">${item}</span>`).join('') || '<span class="muted">No roots found.</span>';
}

function renderGraph(graph) {
  const nodeCount = graph.nodes?.length || 0;
  const edgeCount = graph.edges?.length || 0;
  const typeCount = Object.keys(graph.by_type || {}).length;
  el.graphCount.textContent = `${nodeCount} nodes`;
  const rows = [
    ['Nodes', formatNumber(nodeCount)],
    ['Edges', formatNumber(edgeCount)],
    ['Node types', formatNumber(typeCount)],
    ['Graph id', graph.meta?.graph_id || 'openresearch-graph'],
  ];
  el.graphMeta.innerHTML = rows.map(([label, value]) => `
    <div class="graph-row"><span class="muted">${label}</span><strong>${value}</strong></div>
  `).join('');
}

function createTreeNode(node) {
  const item = document.createElement('div');
  item.className = 'tree-item';

  if (node.kind === 'dir') {
    item.classList.add('collapsed');
    const row = document.createElement('div');
    row.className = 'tree-dir-row';

    const twisty = document.createElement('button');
    twisty.type = 'button';
    twisty.className = 'twisty';
    twisty.textContent = '▾';
    twisty.addEventListener('click', () => item.classList.toggle('collapsed'));

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tree-dir';
    btn.innerHTML = `<div class="tree-path">${node.path}</div><div class="tree-meta"><span>directory</span><span>${node.children?.length || 0} items</span></div>`;
    btn.addEventListener('click', () => item.classList.toggle('collapsed'));

    row.append(twisty, btn);
    item.appendChild(row);

    const children = document.createElement('div');
    children.className = 'tree-children';
    (node.children || []).forEach(child => children.appendChild(createTreeNode(child)));
    item.appendChild(children);
    return item;
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tree-file';
  btn.innerHTML = `<div class="tree-path">${node.path}</div><div class="tree-meta"><span>${node.category || 'file'}</span><span>${sizeLabel(node.size)}</span></div>`;
  btn.addEventListener('click', () => openFile(node.path));
  item.appendChild(btn);
  return item;
}

function renderTree(tree) {
  el.tree.innerHTML = '';
  (tree.children || []).forEach(child => el.tree.appendChild(createTreeNode(child)));
}

function renderSearchResults(results, query) {
  if (!query) {
    el.searchEmpty.textContent = 'Type to search paths across the repo.';
    el.searchEmpty.style.display = 'block';
    el.searchResults.innerHTML = '';
    return;
  }
  if (!results.length) {
    el.searchEmpty.textContent = 'No matching files found.';
    el.searchEmpty.style.display = 'block';
    el.searchResults.innerHTML = '';
    return;
  }
  el.searchEmpty.style.display = 'none';
  el.searchResults.innerHTML = results.map(item => `
    <div class="result-item">
      <button type="button" data-path="${item.path}">
        <div class="result-path">${item.path}</div>
        <div class="result-meta"><span>${item.kind}</span><span>${sizeLabel(item.size)}</span><span>score ${item.score}</span></div>
      </button>
    </div>
  `).join('');
  el.searchResults.querySelectorAll('button[data-path]').forEach(btn => {
    btn.addEventListener('click', () => openFile(btn.dataset.path));
  });
}

async function openFile(path) {
  try {
    const data = await api(`/api/file?path=${encodeURIComponent(path)}`);
    state.currentPath = data.path;
    el.fileMeta.textContent = `${data.path} · ${data.kind}${data.truncated ? ' · truncated preview' : ''}`;
    el.fileContent.textContent = data.content || '';
    el.copyPath.disabled = false;
  } catch (error) {
    el.fileMeta.textContent = `Could not open ${path}`;
    el.fileContent.textContent = String(error.message || error);
    el.copyPath.disabled = true;
  }
}

async function refreshAll() {
  try {
    const [health, summary, graph, tree] = await Promise.all([
      api('/api/health'),
      api('/api/summary'),
      api('/api/graph'),
      api('/api/tree'),
    ]);

    state.summary = summary;
    state.graph = graph;
    state.tree = tree;

    setHealth(Boolean(health.ok), health.repo);
    renderMetrics(summary);
    renderSummary(summary);
    renderGraph(graph);
    renderTree(tree);
  } catch (error) {
    setHealth(false);
    el.fileMeta.textContent = 'Hub failed to load API data';
    el.fileContent.textContent = String(error.message || error);
  }
}

let searchTimer = null;
async function handleSearchInput() {
  const query = el.search.value.trim();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    if (!query) {
      renderSearchResults([], '');
      return;
    }
    try {
      const data = await api(`/api/search?q=${encodeURIComponent(query)}`);
      renderSearchResults(data.results || [], query);
    } catch (error) {
      renderSearchResults([], query);
      el.searchEmpty.textContent = `Search failed: ${String(error.message || error)}`;
      el.searchEmpty.style.display = 'block';
    }
  }, 120);
}

function bindEvents() {
  el.search.addEventListener('input', handleSearchInput);
  el.refreshAll.addEventListener('click', refreshAll);
  el.collapseTree.addEventListener('click', () => {
    document.querySelectorAll('.tree-item').forEach(item => {
      if (item.querySelector('.tree-children')) item.classList.add('collapsed');
    });
  });
  el.copyPath.addEventListener('click', async () => {
    if (!state.currentPath) return;
    await navigator.clipboard.writeText(state.currentPath);
    el.copyPath.textContent = 'Copied';
    setTimeout(() => { el.copyPath.textContent = 'Copy path'; }, 1200);
  });
  window.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      el.search.focus();
    }
  });
}

bindEvents();
refreshAll();
