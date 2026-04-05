const state = {
  summary: null,
  graph: null,
  tree: null,
  workspace: null,
  workspaceTree: null,
  currentPath: '',
};

const el = {
  metrics: document.getElementById('metrics'),
  healthStatus: document.getElementById('health-status'),
  healthStatusBadge: document.getElementById('health-status-badge'),
  repoName: document.getElementById('repo-name'),
  repoDisplay: document.getElementById('repo-display'),
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
  openPreview: document.getElementById('open-preview'),
  reportPreviewWrap: document.getElementById('report-preview-wrap'),
  reportPreview: document.getElementById('report-preview'),
  copyPath: document.getElementById('copy-path'),
  refreshAll: document.getElementById('refresh-all'),
  quickRefresh: document.getElementById('quick-refresh'),
  collapseTree: document.getElementById('collapse-tree'),
  workspaceRoot: document.getElementById('workspace-root'),
  workspaceUpdated: document.getElementById('workspace-updated'),
  workspaceStats: document.getElementById('workspace-stats'),
  workspaceBoard: document.getElementById('workspace-board'),
  workspaceNote: document.getElementById('workspace-note'),
  workspaceAssets: document.getElementById('workspace-assets'),
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

function titleFromPath(path) {
  const name = path.split('/').pop() || path;
  return name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}

function previewUrl(path) {
  return `/preview?path=${encodeURIComponent(path)}`;
}

function updatePreview(path, binary = false) {
  const previewable = !binary && path.startsWith('research-workspace/reports/') && path.endsWith('.html');
  if (!previewable) {
    el.openPreview.hidden = true;
    el.openPreview.href = '#';
    el.reportPreviewWrap.hidden = true;
    el.reportPreview.src = 'about:blank';
    return;
  }

  const href = previewUrl(path);
  el.openPreview.hidden = false;
  el.openPreview.href = href;
  el.reportPreviewWrap.hidden = false;
  el.reportPreview.src = href;
}

function setHealth(ok, repo = '') {
  if (el.healthStatus) {
    el.healthStatus.textContent = ok ? 'Ready' : 'Unavailable';
    el.healthStatus.className = ok ? 'status-ok' : 'status-bad';
  }
  
  // Update health status badge in install banner
  if (el.healthStatusBadge) {
    el.healthStatusBadge.textContent = ok ? 'Ready' : 'Unavailable';
    el.healthStatusBadge.className = ok ? 'status-ok' : 'status-bad';
  }
  
  // Update repo display
  if (repo && el.repoDisplay) {
    el.repoDisplay.textContent = repo;
  }
  if (repo && el.repoName) {
    el.repoName.textContent = repo;
  }
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

function flattenWorkspaceTree(node, output = []) {
  if (!node) {
    return output;
  }
  output.push(node);
  (node.children || []).forEach(child => {
    flattenWorkspaceTree(child, output);
  });
  return output;
}

function normalizeWorkspacePath(path) {
  return (path || '').replace(/\/+$/, '');
}

function findWorkspaceNode(path) {
  if (!state.workspaceTree) {
    return null;
  }
  const normalizedPath = normalizeWorkspacePath(path);
  return flattenWorkspaceTree(state.workspaceTree, []).find(node => normalizeWorkspacePath(node.path) === normalizedPath) || null;
}

function renderDirectory(path) {
  const node = findWorkspaceNode(path);
  if (!node || node.kind !== 'dir') {
    el.fileMeta.textContent = `Could not open folder ${path}`;
    el.fileContent.textContent = 'Folder was not found in the workspace tree.';
    el.copyPath.disabled = true;
    return;
  }

  state.currentPath = node.path;
  const children = (node.children || []).slice().sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === 'dir' ? -1 : 1;
    }
    return a.path.localeCompare(b.path);
  });

  el.fileMeta.textContent = `${node.path} · directory · ${children.length} item${children.length === 1 ? '' : 's'}`;
  el.fileContent.textContent = children.length
    ? children.map(child => `${child.kind === 'dir' ? '[dir] ' : '[file]'}${child.path}${child.size ? ` · ${sizeLabel(child.size)}` : ''}`).join('\n')
    : 'This folder is ready, but currently empty.';
  el.copyPath.disabled = false;
  updatePreview('');
}

function bindWorkspaceInteractions() {
  document.querySelectorAll('[data-open-path]').forEach(button => {
    button.addEventListener('click', () => openFile(button.dataset.openPath));
  });
  document.querySelectorAll('[data-open-dir]').forEach(button => {
    button.addEventListener('click', () => renderDirectory(button.dataset.openDir));
  });
}

function renderWorkspace(workspace) {
  el.workspaceRoot.textContent = workspace.root || 'research-workspace/';
  el.workspaceUpdated.textContent = workspace.exists
    ? `${formatNumber(workspace.file_count)} assets · ${sizeLabel(workspace.total_size)}`
    : 'Workspace root has not been created yet';

  el.workspaceStats.innerHTML = (workspace.stats || []).map(item => `
    <article class="workspace-stat tone-${item.tone}">
      <span class="workspace-stat-value">${item.value}</span>
      <span class="workspace-stat-label">${item.label}</span>
    </article>
  `).join('');

  el.workspaceBoard.innerHTML = (workspace.sections || []).map(section => {
    const folderPath = `research-workspace/${section.key === 'library' ? 'repos' : section.key}/`;
    return `
      <section class="workspace-column tone-${section.tone}">
        <div class="workspace-column-head">
          <div>
            <h3>${section.label}</h3>
            <p>${section.count} items</p>
          </div>
          <span class="workspace-dot tone-${section.tone}"></span>
        </div>
        <div class="workspace-column-body">
          ${section.items.length ? section.items.map(item => `
            <button type="button" class="workspace-paper-card is-interactive" data-open-path="${item.path}">
              <div class="workspace-paper-head">
                <h4>${titleFromPath(item.path)}</h4>
                <span class="workspace-score">${item.extension || item.kind}</span>
              </div>
              <p>${item.path}</p>
              <div class="workspace-tags">
                <span>${item.kind}</span>
                <span>${sizeLabel(item.size)}</span>
              </div>
            </button>
          `).join('') : `
            <button type="button" class="workspace-empty workspace-folder-link" data-open-dir="${folderPath}">
              ${section.description}\n\nOpen ${folderPath}.
            </button>
          `}
        </div>
      </section>
    `;
  }).join('');

  const featured = workspace.featured;
  if (featured) {
    el.workspaceNote.innerHTML = `
      <h4>${titleFromPath(featured.path)}</h4>
      <p class="workspace-summary-line">Featured from ${featured.path}</p>
      <p>Open this generated asset in the viewer to review it, or use the publish preview when the artifact is an HTML report.</p>
      <button type="button" class="ghost-button workspace-open" data-open-path="${featured.path}">Open featured asset</button>
    `;
  } else {
    el.workspaceNote.innerHTML = `
      <h4>Workspace guide</h4>
      <p class="workspace-summary-line">No generated artifacts yet</p>
      <ul>
        <li><button type="button" class="inline-workspace-link" data-open-dir="research-workspace/reports/">Open reports folder</button></li>
        <li><button type="button" class="inline-workspace-link" data-open-dir="research-workspace/notes/">Open literature notes folder</button></li>
        <li><button type="button" class="inline-workspace-link" data-open-dir="research-workspace/repos/">Open repo library folder</button></li>
      </ul>
    `;
  }

  el.workspaceAssets.innerHTML = (workspace.storage || []).map(asset => `
    <button type="button" class="workspace-asset workspace-folder-link" data-open-dir="${asset.path}">
      <div class="workspace-asset-path">${asset.path}</div>
      <div class="workspace-tags">
        <span>${asset.label}</span>
        <span>${asset.count} items</span>
        <span>${sizeLabel(asset.size)}</span>
      </div>
    </button>
  `).join('');

  bindWorkspaceInteractions();
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
    (node.children || []).forEach(child => {
      children.appendChild(createTreeNode(child));
    });
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
  (tree.children || []).forEach(child => {
    el.tree.appendChild(createTreeNode(child));
  });
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
  el.searchResults.querySelectorAll('button[data-path]').forEach(button => {
    button.addEventListener('click', () => openFile(button.dataset.path));
  });
}

async function openFile(path) {
  try {
    const data = await api(`/api/file?path=${encodeURIComponent(path)}`);
    state.currentPath = data.path;
    const flags = [data.kind];
    if (data.binary) flags.push('binary preview');
    if (data.truncated) flags.push('truncated preview');
    el.fileMeta.textContent = `${data.path} · ${flags.join(' · ')} · ${sizeLabel(data.size)}`;
    el.fileContent.textContent = data.content || '';
    el.copyPath.disabled = false;
    updatePreview(data.path, data.binary);
  } catch (error) {
    el.fileMeta.textContent = `Could not open ${path}`;
    el.fileContent.textContent = String(error.message || error);
    el.copyPath.disabled = true;
    updatePreview('');
  }
}

async function refreshAll() {
  try {
    const [health, summary, graph, tree, workspace, workspaceTree] = await Promise.all([
      api('/api/health'),
      api('/api/summary'),
      api('/api/graph'),
      api('/api/tree'),
      api('/api/workspace/summary'),
      api('/api/workspace/tree'),
    ]);

    state.summary = summary;
    state.graph = graph;
    state.tree = tree;
    state.workspace = workspace;
    state.workspaceTree = workspaceTree;

    setHealth(Boolean(health.ok), health.repo);
    renderMetrics(summary);
    renderSummary(summary);
    renderGraph(graph);
    renderWorkspace(workspace);
    renderTree(tree);
  } catch (error) {
    setHealth(false);
    el.fileMeta.textContent = 'Hub failed to load API data';
    el.fileContent.textContent = String(error.message || error);
    updatePreview('');
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
  
  // Quick refresh button (already handled in inline script, but add here for completeness)
  if (el.quickRefresh) {
    el.quickRefresh.addEventListener('click', () => {
      el.refreshAll.click();
    });
  }
  
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
  window.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      el.search.focus();
    }
  });
}

bindEvents();
refreshAll();
