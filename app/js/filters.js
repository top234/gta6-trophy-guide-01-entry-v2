// Filtering and sorting for the checklist. Pure functions: given the trophy
// list, the toolbar state and the earned set, return the trophies to show.
import { GRADE_ORDER } from './data.js';

export function applyFilters(trophies, state, earned) {
  const q = state.search.trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (state.kind !== 'all') {
      if (state.kind === 'online') return false; // No online trophies: all 55 are single-player.
      if (t.kind !== state.kind) return false;
    }
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.difficulty !== 'all' && t.difficulty !== Number(state.difficulty)) return false;
    if (state.earned === 'earned' && !earned.has(t.id)) return false;
    if (state.earned === 'unearned' && earned.has(t.id)) return false;
    if (state.missableOnly && !t.missable) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.tip}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const byName = (a, b) => a.name.localeCompare(b.name);
  if (state.sort === 'name') list = [...list].sort(byName);
  else if (state.sort === 'grade') {
    list = [...list].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || byName(a, b));
  } else if (state.sort === 'difficulty') {
    list = [...list].sort((a, b) => b.difficulty - a.difficulty || byName(a, b));
  } else {
    // Roadmap order: stage first, then the official list order.
    list = [...list].sort((a, b) => a.roadmap - b.roadmap || a.id - b.id);
  }
  return list;
}
