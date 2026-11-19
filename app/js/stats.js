// Progress numbers for the header and the stats dashboard.
export function computeStats(trophies, earned) {
  const total = trophies.length;
  const earnedCount = trophies.filter((t) => earned.has(t.id)).length;
  const pct = total === 0 ? 0 : Math.round((earnedCount / total) * 100);
  const byGrade = {};
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    byGrade[grade] = {
      total: inGrade.length,
      earned: inGrade.filter((t) => earned.has(t.id)).length,
    };
  }
  // Story trophies carry timeMinutes 0 ("across the story"), so the sum is
  // the side-content time only and is never double-counted.
  const timeRemaining = trophies
    .filter((t) => !earned.has(t.id))
    .reduce((sum, t) => sum + (t.timeMinutes || 0), 0);
  const missableLeft = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  const missableTotal = trophies.filter((t) => t.missable).length;
  return { total, earnedCount, pct, byGrade, timeRemaining, missableLeft, missableTotal };
}

export function formatHours(minutes) {
  if (minutes <= 0) return '0 h';
  const hours = minutes / 60;
  if (hours < 1) return `≈ ${minutes} min`;
  if (Number.isInteger(hours)) return `≈ ${hours} h`;
  return `≈ ${hours.toFixed(1)} h`;
}
