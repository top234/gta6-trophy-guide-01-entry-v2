// Renders the header progress, stats dashboard, roadmap strip, roadmap view
// and trophy cards. All text from the data goes through textContent, so a
// trophy name can never break the page.
import { GRADE_LABELS, KIND_LABELS } from './data.js';
import { formatHours } from './stats.js';

const $ = (id) => document.getElementById(id);

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export function renderStats(stats) {
  $('progressText').textContent = `${stats.earnedCount} of ${stats.total} earned`;
  $('progressPct').textContent = `${stats.pct}%`;
  $('progressFill').style.width = `${stats.pct}%`;
  $('statEarned').textContent = `${stats.earnedCount} / ${stats.total}`;
  $('statTime').textContent = `${formatHours(stats.timeRemaining)} left`;
  $('statMissable').textContent = stats.missableLeft === 0
    ? 'none left'
    : `${stats.missableLeft} left`;
  $('statGrade').textContent =
    `${stats.byGrade.platinum.earned} / ${stats.byGrade.platinum.total}`;
  const bars = $('gradeBars');
  bars.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const g = stats.byGrade[grade];
    const pct = g.total === 0 ? 0 : Math.round((g.earned / g.total) * 100);
    const wrap = el('div', 'grade-bar');
    wrap.append(el('strong', null, `${GRADE_LABELS[grade]} — ${g.earned}/${g.total}`));
    const track = el('div', 'track');
    const fill = el('div', `fill ${grade}`);
    fill.style.width = `${pct}%`;
    track.append(fill);
    wrap.append(track);
    bars.append(wrap);
  }
}

export function renderStageChips(stages, earned) {
  const list = $('stageChips');
  list.replaceChildren();
  for (const stage of stages) {
    const done = stage.trophies.filter((t) => earned.has(t.id)).length;
    const li = document.createElement('li');
    li.append(el('b', null, `Stage ${stage.num} — ${stage.title}`));
    li.append(el('span', 'n', `${stage.trophies.length} trophies · ${done} earned`));
    list.append(li);
  }
}

export function renderRoadmap(stages, earned) {
  const view = $('roadmapView');
  view.replaceChildren();
  for (const stage of stages) {
    const section = el('section', 'stage' + (stage.num === 7 ? ' pnr' : ''));
    const h = el('h3');
    h.append(el('span', 'stage-num', `Stage ${stage.num}`));
    h.append(document.createTextNode(stage.title));
    section.append(h);
    section.append(el('p', null, stage.blurb));
    const ul = document.createElement('ul');
    for (const t of stage.trophies) {
      const li = document.createElement('li');
      li.append(document.createTextNode(t.name));
      const pill = el('span', `g ${t.grade}`, GRADE_LABELS[t.grade]);
      li.append(pill);
      if (t.missable) li.append(document.createTextNode(' ⚠ Missable'));
      if (earned.has(t.id)) li.append(document.createTextNode(' ✓ Earned'));
      ul.append(li);
    }
    section.append(ul);
    view.append(section);
  }
}

function buildCard(t, ctx) {
  const { earned, spoiler, openIds, onToggleEarned, onToggleGuide } = ctx;
  const isEarned = earned.has(t.id);
  const hiddenBySpoiler = spoiler && t.hidden && !isEarned;
  const card = el('article', 'card' + (isEarned ? ' earned' : '') + (t.missable ? ' missable-card' : ''));
  card.id = `trophy-${t.id}`;

  const top = el('div', 'card-top');
  top.append(el('span', `grade-badge ${t.grade}`, GRADE_LABELS[t.grade]));
  top.append(el('span', 'kind-tag', `${KIND_LABELS[t.kind]} · Stage ${t.roadmap}`));
  card.append(top);

  card.append(el('h3', null, hiddenBySpoiler ? 'Hidden trophy' : t.name));
  card.append(el('p', 'desc', hiddenBySpoiler
    ? 'Hidden until earned — this is a story trophy. Tick “Earned” below to reveal it.'
    : t.description));

  const meta = el('div', 'meta');
  meta.append(el('span', 'stars', stars(t.difficulty)));
  meta.append(el('span', 'diff-label', `${t.difficultyLabel} (maker's estimate)`));
  meta.append(el('span', 'time-chip', `⏱ ${t.time}`));
  if (t.count !== null && t.count !== undefined) {
    meta.append(el('span', 'count-chip', `× ${t.count.toLocaleString('en-US')}`));
  }
  card.append(meta);

  if (t.missable) {
    card.append(el('p', 'warn', `⚠ MISSABLE — ${t.pointOfNoReturn}`));
  }

  const earn = el('label', 'earn');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', hiddenBySpoiler ? `Mark trophy ${t.id} as earned` : `Mark ${t.name} as earned`);
  box.addEventListener('change', () => onToggleEarned(t.id, box.checked));
  earn.append(box);
  earn.append(document.createTextNode(isEarned ? 'Earned ✓' : 'Mark as earned'));
  card.append(earn);

  if (!hiddenBySpoiler) {
    const open = openIds.has(t.id);
    const btn = el('button', 'guide-btn', open ? 'Hide the guide' : 'Read the guide');
    btn.type = 'button';
    btn.addEventListener('click', () => onToggleGuide(t.id));
    card.append(btn);
    if (open) {
      const body = el('div', 'guide-body');
      body.append(el('p', null, t.guide));
      const tip = el('p', 'tip');
      tip.append(el('strong', null, 'Tip: '));
      tip.append(document.createTextNode(t.tip));
      body.append(tip);
      const src = el('p', 'sources', 'Sources: ');
      t.sources.forEach((s, i) => {
        if (i > 0) src.append(document.createTextNode(' · '));
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.target = '_blank';
        a.rel = 'noopener';
        src.append(a);
      });
      body.append(src);
      card.append(body);
    }
  } else {
    card.append(el('p', 'hidden-note', 'Guide hidden until this trophy is earned.'));
  }
  return card;
}

export function renderCards(list, ctx) {
  const wrap = $('cards');
  wrap.replaceChildren();
  for (const t of list) wrap.append(buildCard(t, ctx));
  $('resultCount').textContent = `Showing ${list.length} of ${ctx.total} trophies`;
  const empty = $('emptyNote');
  if (list.length === 0) {
    empty.hidden = false;
    empty.textContent = ctx.kind === 'online'
      ? 'No online trophies — all 55 are single-player, so this filter is always empty.'
      : 'No trophies match these filters. Loosen the search or the filters.';
  } else {
    empty.hidden = true;
  }
}
