// Offline d3-force layout for data/topology.json.
// Run via `npm run bake-topology`. Writes coordinates back into the JSON;
// the Hugo build itself ships no JavaScript.
//
// Forces are stratified — each tool group has a target y-band, languages
// are pulled to a left x-anchor, architecture nodes float gently toward
// the middle. The link force then settles the local arrangement organically.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  forceSimulation, forceLink, forceManyBody,
  forceCollide, forceX, forceY,
} from 'd3-force';

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = join(here, '..', 'data', 'topology.json');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));

const WIDTH  = 880;
const HEIGHT = 640;

const bandY = {
  geo:       70,
  backend:  220,
  frontend: 350,
  ai:       470,
  realtime: 545,
  ops:      610,
};

const archYHint = 380;

// Pin only the cartographic anchors and the orphan-ish real-time pair.
// The Languages valley (an arch feature) acts as the watershed that
// collects the language nodes via short-distance meta edges; the
// languages themselves are free to settle around it.
const pins = {
  valley: { fx: 70,  fy: 320 },
  mqtt:   { fx: 470, fy: 545 },
  webrtc: { fx: 600, fy: 545 },
};

const nodes = data.nodes.map(n => ({ ...n, ...(pins[n.id] ?? {}) }));
const edges = data.edges.map(e => ({
  source: e.from,
  target: e.to,
  meta: e.kind === 'meta',
}));

const sim = forceSimulation(nodes)
  .force('link', forceLink(edges)
    .id(d => d.id)
    .distance(e => {
      const src = typeof e.source === 'string' ? e.source : e.source.id;
      // Valley is a tight collector — shorter, stronger pull.
      if (src === 'valley') return 55;
      if (e.meta) return 130;
      return 85;
    })
    .strength(e => {
      const src = typeof e.source === 'string' ? e.source : e.source.id;
      if (src === 'valley') return 0.7;
      if (e.meta) return 0.25;
      return 0.6;
    }))
  .force('charge', forceManyBody().strength(-260))
  .force('collide', forceCollide()
    .radius(d => d.kind === 'arch' ? 60 : 34)
    .strength(0.9))
  .force('y', forceY(d => {
    if (d.kind === 'arch') return archYHint;
    return bandY[d.group] ?? HEIGHT / 2;
  }).strength(d => d.kind === 'arch' ? 0.05 : 0.6))
  .force('x', forceX(d => {
    if (d.group === 'lang') return 80;
    if (d.kind === 'arch') return WIDTH * 0.6;
    return WIDTH * 0.55;
  }).strength(d => d.group === 'lang' ? 0 : (d.kind === 'arch' ? 0.04 : 0.09)))
  .stop();

const TICKS = 700;
for (let i = 0; i < TICKS; i++) sim.tick();

// Fit & center within a margin without distorting aspect.
const MARGIN = { x: [40, 840], y: [25, 615] };
const xs = nodes.map(n => n.x);
const ys = nodes.map(n => n.y);
const minX = Math.min(...xs), maxX = Math.max(...xs);
const minY = Math.min(...ys), maxY = Math.max(...ys);
const sX = (MARGIN.x[1] - MARGIN.x[0]) / Math.max(1, maxX - minX);
const sY = (MARGIN.y[1] - MARGIN.y[0]) / Math.max(1, maxY - minY);
const s = Math.min(sX, sY);
const usedW = (maxX - minX) * s;
const usedH = (maxY - minY) * s;
const padX = ((MARGIN.x[1] - MARGIN.x[0]) - usedW) / 2;
const padY = ((MARGIN.y[1] - MARGIN.y[0]) - usedH) / 2;

for (const n of nodes) {
  n.x = Math.round(MARGIN.x[0] + padX + (n.x - minX) * s);
  n.y = Math.round(MARGIN.y[0] + padY + (n.y - minY) * s);
}

// Compute a tight viewBox around the laid-out nodes so we don't ship
// empty canvas. Right-side slack accounts for labels that extend right
// of the dot ("OpenStreetMap" is the longest tool label at ~110px);
// arch labels are centered so they need slack on both sides.
const finalXs = nodes.map(n => n.x);
const finalYs = nodes.map(n => n.y);
const padLeft = 30, padRight = 130, padTop = 25, padBottom = 30;
const vbX = Math.min(...finalXs) - padLeft;
const vbY = Math.min(...finalYs) - padTop;
const vbW = Math.max(...finalXs) - vbX + padRight;
const vbH = Math.max(...finalYs) - vbY + padBottom;
data.viewbox = `${vbX} ${vbY} ${vbW} ${vbH}`;

// Strip simulation-runtime fields, keep declared keys.
const cleaned = nodes.map(({ vx, vy, fx, fy, index, ...rest }) => rest);

// ---- Altimetric contours around each architectural feature ----
// Per-feature shape (peak round, ridge/range elongated, valley elongated bowl,
// archipelago = scattered small islands). The major axis tilts toward the
// centroid of the feature's connected nodes — that's the "force in play"
// signal showing in the contour shape. Per-id deterministic randomness
// gives them the hand-drawn wobble.

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothClosedPath(pts) {
  const n = pts.length;
  if (n < 3) return '';
  const f = (v) => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f(cp1x)},${f(cp1y)} ${f(cp2x)},${f(cp2y)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}

function forceDirection(arch, connected) {
  let dx = 0, dy = 0;
  for (const n of connected) {
    dx += n.x - arch.x;
    dy += n.y - arch.y;
  }
  const len = Math.hypot(dx, dy) || 1;
  return { dx: dx / len, dy: dy / len };
}

function ovalContour(arch, feature, layer, dir) {
  const rng = makeRng(hashString(`${arch.id}-${layer}`));
  let major, minor, tilt;
  switch (feature) {
    case 'peak':   major = 58 + layer * 24; minor = 50 + layer * 22; tilt = Math.atan2(dir.dy, dir.dx); break;
    case 'ridge':  major = 130 + layer * 28; minor = 38 + layer * 14; tilt = Math.atan2(dir.dy, dir.dx); break;
    case 'range':  major = 150 + layer * 30; minor = 38 + layer * 14; tilt = 0; break;
    case 'valley': major = 130 + layer * 26; minor = 80 + layer * 22; tilt = 0; break;
    default:       major = 60 + layer * 22; minor = 55 + layer * 22; tilt = 0;
  }
  const jitter = 9 + layer * 3;
  const points = 38;
  const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * 2 * Math.PI;
    const wobble = Math.sin(a * 3 + layer + arch.x * 0.013) * 0.5
                 + Math.cos(a * 5 + arch.y * 0.011) * 0.3;
    const j = (rng() - 0.5) * jitter + wobble * jitter;
    const lx = (major + j) * Math.cos(a);
    const ly = (minor + j * 0.7) * Math.sin(a);
    pts.push([
      arch.x + lx * cosT - ly * sinT,
      arch.y + lx * sinT + ly * cosT,
    ]);
  }
  return smoothClosedPath(pts);
}

function archipelagoIslands(arch, connected) {
  const rng = makeRng(hashString(arch.id));
  const dir = forceDirection(arch, connected);
  const perpX = -dir.dy, perpY = dir.dx;
  const islands = [];
  const islandCount = 4;
  const spacing = 46;
  for (let k = 0; k < islandCount; k++) {
    const t = k - (islandCount - 1) / 2;
    // Slight drift along force direction so the chain isn't perfectly perpendicular
    const drift = (rng() - 0.5) * 18;
    const cx = arch.x + perpX * t * spacing + dir.dx * drift;
    const cy = arch.y + perpY * t * spacing + dir.dy * drift;
    const baseR = 18 + rng() * 10;
    const points = 18;
    const pts = [];
    for (let i = 0; i < points; i++) {
      const a = (i / points) * 2 * Math.PI;
      const wobble = Math.sin(a * 4 + k) * 3;
      const r = baseR + (rng() - 0.5) * 5 + wobble;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    islands.push(smoothClosedPath(pts));
  }
  return islands;
}

const nodeById = new Map(cleaned.map(n => [n.id, n]));
const archNodes = cleaned.filter(n => n.kind === 'arch');
const connectionsOf = (id) => {
  const out = [];
  for (const e of data.edges) {
    if (e.from === id) { const n = nodeById.get(e.to); if (n) out.push(n); }
    if (e.to === id)   { const n = nodeById.get(e.from); if (n) out.push(n); }
  }
  return out;
};

const contours = [];
for (const arch of archNodes) {
  const feature = arch.feature || 'peak';
  const connected = connectionsOf(arch.id);
  if (feature === 'archipelago') {
    for (const d of archipelagoIslands(arch, connected)) {
      contours.push({ id: arch.id, layer: 0, d });
    }
  } else {
    const dir = forceDirection(arch, connected);
    for (let layer = 0; layer < 3; layer++) {
      contours.push({ id: arch.id, layer, d: ovalContour(arch, feature, layer, dir) });
    }
  }
}

// Custom serializer keeps each node/edge/contour on one line for readable diffs.
function serialize(d) {
  const out = ['{'];
  out.push(`  "title": ${JSON.stringify(d.title)},`);
  out.push(`  "intro": ${JSON.stringify(d.intro)},`);
  out.push(`  "viewbox": ${JSON.stringify(d.viewbox)},`);
  out.push(`  "nodes": [`);
  cleaned.forEach((n, i) => {
    const sep = i < cleaned.length - 1 ? ',' : '';
    out.push(`    ${JSON.stringify(n)}${sep}`);
  });
  out.push(`  ],`);
  out.push(`  "edges": [`);
  d.edges.forEach((e, i) => {
    const sep = i < d.edges.length - 1 ? ',' : '';
    out.push(`    ${JSON.stringify(e)}${sep}`);
  });
  out.push(`  ],`);
  out.push(`  "contours": [`);
  contours.forEach((c, i) => {
    const sep = i < contours.length - 1 ? ',' : '';
    out.push(`    ${JSON.stringify(c)}${sep}`);
  });
  out.push(`  ]`);
  out.push('}');
  return out.join('\n') + '\n';
}

writeFileSync(dataPath, serialize(data));
console.log(`Wrote ${cleaned.length} nodes and ${contours.length} contours after ${TICKS} ticks.`);
