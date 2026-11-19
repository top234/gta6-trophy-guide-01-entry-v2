// Bootstrap: loads the data, wires the toolbar, the views and the hash
// routing, and re-renders on every change. Works with the network off — the
// only fetch is the local data/trophies.json.
import { loadTrophies } from './data.js';
import { loadEarned, saveEarned, loadSpoiler, saveSpoiler, exportFile, parseImport } from './store.js';
import { applyFilters } from './filters.js';
import { buildStages } from './roadmap.js';
import { computeStats } from './stats.js';
import { renderStats, renderStageChips, renderRoadmap, renderCards } from './render.js';

const $ = (id) => document.getElementById(id);

const state = {
  search: '',
  kind: 'all',
  grade: 'all',
  difficulty: 'all',
  earned: 'all',
  sort: 'roadmap',
  missableOnly: false,
  view: 'all',
};
let trophies = [];
let stages = [];
let earned = loadEarned();
let spoiler = loadSpoiler();
const openIds = new Set();

function readToolbar() {
  state.search = $('search').value;
  state.kind = $('kind').value;
  state.grade = $('grade').value;
  state.difficulty = $('difficulty').value;
  state.earned = $('earned').value;
  state.sort = $('sort').value;
  state.missableOnly = $('missableOnly').checked;
  spoiler = $('spoiler').checked;
}

function renderAll() {
  const stats = computeStats(trophies, earned);
  renderStats(stats);
  renderStageChips(stages, earned);
  renderRoadmap(stages, earned);
  $('missableCount').textContent = String(stats.missableTotal);
  const list = applyFilters(trophies, state, earned);
  renderCards(list, {
    total: trophies.length,
    kind: state.kind,
    earned,
    spoiler,
    openIds,
    onToggleEarned: (id, checked) => {
      if (checked) earned.add(id);
      else earned.delete(id);
      saveEarned(earned);
      renderAll();
    },
    onToggleGuide: (id) => {
      if (openIds.has(id)) openIds.delete(id);
      else openIds.add(id);
      renderAll();
    },
  });
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.view-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  $('roadmapView').hidden = view !== 'roadmap';
  $('checklistView').hidden = view === 'roadmap';
  $('roadmapStrip').hidden = view === 'roadmap';
  $('missableBanner').hidden = view === 'roadmap';
  if (view === 'missable') {
    state.missableOnly = true;
    $('missableOnly').checked = true;
  } else if (view === 'all') {
    state.missableOnly = false;
    $('missableOnly').checked = false;
  }
  renderAll();
}

// Hash routing, so a view can be linked or screenshotted directly:
// #view=roadmap, #view=missable, #trophy=28, #spoiler=1 (combine with &).
function applyHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const view = params.get('view');
  if (view === 'roadmap' || view === 'missable' || view === 'all') setView(view);
  if (params.get('spoiler') === '1') {
    spoiler = true;
    $('spoiler').checked = true;
    saveSpoiler(true);
  }
  const trophyId = Number(params.get('trophy'));
  if (Number.isInteger(trophyId) && trophyId >= 1 && trophyId <= 55) {
    openIds.add(trophyId);
    renderAll();
    const node = document.getElementById(`trophy-${trophyId}`);
    if (node) node.scrollIntoView({ block: 'start' });
  }
}

function wire() {
  document.querySelectorAll('.view-btn').forEach((b) => {
    b.addEventListener('click', () => setView(b.dataset.view));
  });
  $('goMissable').addEventListener('click', () => setView('missable'));
  for (const id of ['search', 'kind', 'grade', 'difficulty', 'earned', 'sort']) {
    $(id).addEventListener('input', () => { readToolbar(); renderAll(); });
    $(id).addEventListener('change', () => { readToolbar(); renderAll(); });
  }
  $('missableOnly').addEventListener('change', () => {
    readToolbar();
    if (!state.missableOnly) setView('all');
    else renderAll();
  });
  $('spoiler').addEventListener('change', () => {
    readToolbar();
    saveSpoiler(spoiler);
    renderAll();
  });
  $('expandAll').addEventListener('click', () => {
    const allOpen = openIds.size >= trophies.length;
    openIds.clear();
    if (!allOpen) for (const t of trophies) openIds.add(t.id);
    $('expandAll').textContent = allOpen ? 'Show all guides' : 'Hide all guides';
    renderAll();
  });
  $('export').addEventListener('click', () => exportFile(earned));
  $('import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const next = parseImport(await file.text());
    if (next) {
      earned = next;
      saveEarned(earned);
      renderAll();
    } else {
      alert('That file is not a valid trophy-progress file.');
    }
    e.target.value = '';
  });
  window.addEventListener('hashchange', applyHash);
}

const doc = await loadTrophies();
trophies = doc.trophies;
stages = buildStages(trophies);
$('spoiler').checked = spoiler;
wire();
renderAll();
applyHash();
