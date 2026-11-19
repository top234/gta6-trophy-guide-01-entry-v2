// Saved progress: which trophies are earned, and the spoiler setting.
// Both live only in this browser's localStorage — nothing leaves the machine.
const EARNED_KEY = 'gta6-trophy-guide-v2-earned';
const SPOILER_KEY = 'gta6-trophy-guide-v2-spoiler';

export function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    if (!Array.isArray(raw)) return new Set();
    return new Set(raw.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSpoiler() {
  return localStorage.getItem(SPOILER_KEY) === '1';
}

export function saveSpoiler(on) {
  localStorage.setItem(SPOILER_KEY, on ? '1' : '0');
}

// Exported file shape: { game, earned: [ids], exportedAt }.
export function exportFile(earned) {
  const payload = {
    game: 'Grand Theft Auto VI',
    earned: [...earned].sort((a, b) => a - b),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

// Accepts the exported shape, or a plain array of ids. Returns a Set, or null
// when the file is not a valid progress file.
export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) return null;
  if (!ids.every((n) => Number.isInteger(n) && n >= 1 && n <= 55)) return null;
  return new Set(ids);
}
