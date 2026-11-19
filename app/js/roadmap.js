// Groups the trophies into the roadmap's 8 stages, in play order.
import { STAGES } from './data.js';

export function buildStages(trophies) {
  return STAGES.map((stage) => ({
    ...stage,
    trophies: trophies
      .filter((t) => t.roadmap === stage.num)
      .sort((a, b) => a.id - b.id),
  }));
}
