// GTA 6 trophy guide entry (Node 22, standard library only): the guide is
// this directory's app/ folder — plain static files a browser opens at
// app/index.html (ES modules, CSS, no build step), offline: it loads nothing
// over the network, and its trophy list and guides are app/data/trophies.json.
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes /output/dossier.json,
// the summary the judge reads (screenshots, the first load's files and bytes,
// and the source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to
// be byte for byte what its own copy writes.
//
// The program refuses a broken entry instead of handing one in: app/
// must hold index.html and a 55-trophy list, and screenshots/ must hold
// three or four real renders, each at most 256 KiB. It never removes the
// output directory itself — the grader mounts that directory, and removing
// it fails the run — it only creates the directory if needed and copies
// into it. Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX_SHOT_BYTES = 262144;

function fail(message) {
  throw new Error(`gta6-trophy-guide-01 entry refused: ${message}`);
}

function checkEntry() {
  if (!existsSync(join(here, 'app', 'index.html'))) {
    fail('app/index.html is missing');
  }
  let trophies;
  try {
    trophies = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
  } catch {
    fail('app/data/trophies.json is not valid JSON');
  }
  if (!Array.isArray(trophies.trophies) || trophies.trophies.length !== 55) {
    fail(`app/data/trophies.json must name 55 trophies, found ${trophies.trophies?.length ?? 0}`);
  }
  for (const t of trophies.trophies) {
    if (!t.name || !t.description || !t.grade || !t.guide || !t.tip) {
      fail(`trophy ${t.id ?? '?'} is missing a name, description, grade, guide or tip`);
    }
  }
  const shotsDir = join(here, 'screenshots');
  if (!existsSync(shotsDir)) fail('screenshots/ is missing');
  const shots = readdirSync(shotsDir)
    .filter((f) => /\.(png|jpe?g)$/i.test(f))
    .sort();
  if (shots.length < 3 || shots.length > 4) {
    fail(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
  }
  for (const shot of shots) {
    const size = statSync(join(shotsDir, shot)).size;
    if (size > MAX_SHOT_BYTES) {
      fail(`screenshots/${shot} is ${size} bytes, over the 256 KiB cap`);
    }
  }
}

checkEntry();

mkdirSync(out, { recursive: true });
// Clear only our own subdirectories inside the output directory, so a
// repeat run into the same directory cannot leave stale files behind
// (a renamed module, a deleted screenshot) and stays byte-identical.
// The output directory itself is never removed: the grader mounts it.
for (const sub of ['app', 'screenshots']) {
  const target = join(out, sub);
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files: app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
