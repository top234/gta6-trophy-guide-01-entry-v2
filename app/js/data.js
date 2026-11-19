// Loads the trophy list and holds the shared constants: roadmap stages,
// kind labels and grade order. Everything the app shows comes from
// app/data/trophies.json — nothing is fetched from anywhere else.
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const doc = await response.json();
  return doc;
}

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side mission',
  activity: 'Activity',
  collectible: 'Collectible',
  crime: 'Crime',
  money: 'Money',
  other: 'Other',
  online: 'Online',
};

// The 8 stages of the platinum roadmap, in the order a player should do them.
export const STAGES = [
  {
    num: 1,
    title: 'Play the story in order',
    blurb: 'Chapters 1–4 and the named story missions. Chapter trophies unlock automatically as each chapter closes. Do the Chapter 1 meditation spot now — it is the one missable trophy.',
  },
  {
    num: 2,
    title: 'Strangers & side missions',
    blurb: 'The five stranger finales plus the 8-strand silver. Start in Chapter 2 and do each strand as it appears; there are more than 8 strands, so skip the ones you dislike.',
  },
  {
    num: 3,
    title: 'Activities & sports',
    blurb: 'Nine activity types, the shooting range, drone races, races, fishing, the arcade, meditation and hunting. Spread these across the story instead of leaving them all for the end.',
  },
  {
    num: 4,
    title: 'Collectibles & exploration',
    blurb: 'Cards, WAiNK scans, vehicles and all 52 areas of Leonida. Collect as you go — the map is huge and three full card sets is a long search at the end.',
  },
  {
    num: 5,
    title: 'Crime & chaos',
    blurb: 'Robberies, bank vaults, armored trucks, gang operations, Combat Focus and the airport. Bring a fast getaway car and plan each escape before you start.',
  },
  {
    num: 6,
    title: 'Money & lifestyle',
    blurb: 'Laundering marked bills, spending, garages, the Scooter Bros app, challenges and the odd one-offs. Most of these fill up on their own while you play everything else.',
  },
  {
    num: 7,
    title: 'Point of no return — then the final mission',
    blurb: 'Check the missable trophy first, make a manual save, then play the final mission. Story moments cannot be replayed, and the final mission closes the story.',
  },
  {
    num: 8,
    title: 'Cleanup & the Platinum',
    blurb: 'The 100% completion checklist, then the Platinum pops. Most of the checklist is already done by now if you followed the stages in order.',
  },
];
