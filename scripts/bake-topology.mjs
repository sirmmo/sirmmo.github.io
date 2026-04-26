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

// Pin a few nodes that the link force can't position well on its own:
// languages need a left-edge spine (otherwise their many links drag them
// to the centre, or their absence of links lets them drift anywhere),
// and the real-time pair has too few/no edges to settle.
const pins = {
  python:     { fx: 80,  fy: 50  },
  typescript: { fx: 80,  fy: 130 },
  javascript: { fx: 80,  fy: 210 },
  java:       { fx: 80,  fy: 290 },
  csharp:     { fx: 80,  fy: 370 },
  php:        { fx: 80,  fy: 450 },
  c:          { fx: 80,  fy: 530 },
  cpp:        { fx: 80,  fy: 605 },
  mqtt:       { fx: 470, fy: 545 },
  webrtc:     { fx: 600, fy: 545 },
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
    .distance(e => e.meta ? 130 : 85)
    .strength(e => e.meta ? 0.25 : 0.6))
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

// Custom serializer keeps each node/edge on one line for readable diffs.
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
  out.push(`  ]`);
  out.push('}');
  return out.join('\n') + '\n';
}

writeFileSync(dataPath, serialize(data));
console.log(`Wrote ${cleaned.length} nodes after ${TICKS} ticks.`);
