#!/usr/bin/env node
/**
 * scan.mjs — walks the projects/ sibling directory, extracts metadata from
 * README.md / PROJECT_STATE.json, detects sub-dashboards, and writes
 * public/projects.json.
 *
 * Runs with zero npm dependencies.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUB_ROOT = path.resolve(__dirname, '..');
// projects/ lives one level up from the hub project folder
const PROJECTS_ROOT = path.resolve(HUB_ROOT, '..');
const WORKSPACE_ROOT = path.resolve(PROJECTS_ROOT, '..');
const OUT_FILE = path.join(HUB_ROOT, 'public', 'projects.json');

/* ----- Domain inference ----- */
const DOMAIN_RULES = [
  { domain: 'neuro', match: /connectome|brain|nova-avatar|nova-second|second-brain|synap|neur/i },
  { domain: 'space', match: /space|spacex|esrange|satellite|ground-station|rocket|launch/i },
  { domain: 'finance', match: /portfolio|invest|ipo|economics|cfo|financial|coin/i },
  { domain: 'bio', match: /bio|health|weed|grow|dna|genome|supplement/i },
  { domain: 'learning', match: /learn|study|youtube|knowledge|speaking|curric/i },
  { domain: 'workflow', match: /workflow|automation|pipeline|cron|ingestion/i },
  { domain: 'media', match: /video|ad-|ad_|media|audio|music|canvas/i },
  { domain: 'worlds', match: /world|region|island|avatar|game|godot/i },
  { domain: 'work', match: /miele|fpna|maker|ops/i }
];

const STATUS_COLORS = {
  active: '#8cff66',
  prototyping: '#46e0ff',
  validating: '#ffb547',
  paused: '#ff5bd8',
  captured: '#a45bff',
  completed: '#5a92ff',
  archived: '#7a819e',
  discarded: '#ff6b6b',
  unknown: '#a0a6bd'
};

const DOMAIN_COLORS = {
  neuro: '#a45bff',
  space: '#46e0ff',
  finance: '#8cff66',
  bio: '#ffb547',
  learning: '#5a92ff',
  workflow: '#bcd6ff',
  media: '#ff5bd8',
  worlds: '#8db7ff',
  work: '#ff6b6b',
  unknown: '#a0a6bd'
};

/* ----- File helpers ----- */
async function safeRead(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

async function safeJson(p) {
  const raw = await safeRead(p);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isTodayLocal(dateLike) {
  if (!dateLike) return false;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function dirSize(dir, limit = 4000, maxDepth = 5, currentDepth = 0) {
  let count = 0;
  async function walk(d, depth) {
    if (count >= limit || depth > maxDepth) return;
    let items;
    try {
      items = await fs.readdir(d, { withFileTypes: true });
    } catch (err) {
      console.error(`[scan] Error reading directory ${d}: ${err.message}`);
      return;
    }
    for (const it of items) {
      if (count >= limit || depth > maxDepth) return;
      if (it.name.startsWith('.') || it.name === 'node_modules') continue;

      const fullPath = path.join(d, it.name);
      let stats;
      try {
        stats = await fs.lstat(fullPath); // Use lstat to check for symlinks
      } catch (err) {
        console.error(`[scan] Error getting stats for ${fullPath}: ${err.message}`);
        continue;
      }

      if (stats.isSymbolicLink()) {
        // Optionally, resolve symlinks and check if they point to already visited paths
        // For now, we just skip them to prevent infinite loops
        continue;
      }

      count++;
      if (stats.isDirectory()) await walk(fullPath, depth + 1);
    }
  }
  await walk(dir, currentDepth);
  return count;
}

async function newestMtime(dir, maxDepth = 2, currentDepth = 0) {
  let newest = 0;
  async function walk(d, depth) {
    if (depth > maxDepth) return;
    let items;
    try {
      items = await fs.readdir(d, { withFileTypes: true });
    } catch (err) {
      console.error(`[scan] Error reading directory ${d}: ${err.message}`);
      return;
    }
    for (const it of items) {
      if (it.name.startsWith('.') || it.name === 'node_modules') continue;
      const p = path.join(d, it.name);
      try {
        const s = await fs.lstat(p); // Use lstat
        if (s.isSymbolicLink()) {
          continue; // Skip symlinks
        }
        if (s.mtimeMs > newest) newest = s.mtimeMs;
        if (s.isDirectory() && depth < maxDepth) await walk(p, depth + 1);
      } catch (err) {
        console.error(`[scan] Error getting stats for ${p}: ${err.message}`);
        /* ignore */
      }
    }
  }
  await walk(dir, currentDepth);
  return newest;
}

/* ----- Parsers ----- */
function humanize(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractOneLiner(readme) {
  if (!readme) return null;
  // Try "One-liner: ..." pattern
  const oneLiner = readme.match(/one[-\s]*liner[^\n]*[:\-]\s*([^\n]+)/i);
  if (oneLiner) return oneLiner[1].trim().replace(/^["'`*]|["'`*]$/g, '');
  // Try first non-heading, non-blank paragraph
  const lines = readme.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('>')) continue;
    if (trimmed.startsWith('|')) continue;
    if (trimmed.startsWith('---')) continue;
    if (trimmed.startsWith('*')) {
      const m = trimmed.match(/^\*\s*\*\*[^*]+\*\*\s*[:\-]\s*(.+)$/);
      if (m) return m[1].trim();
      continue;
    }
    if (trimmed.length > 220) return trimmed.slice(0, 217) + '…';
    return trimmed;
  }
  return null;
}

function extractField(readme, label) {
  if (!readme) return null;
  const re = new RegExp(`^\\s*[-*]?\\s*\\*?\\*?${label}\\*?\\*?\\s*[:\\-]\\s*(.+)$`, 'im');
  const m = readme.match(re);
  return m ? m[1].trim().replace(/^["'`*]|["'`*]$/g, '').trim() : null;
}

function pickDomain(readme, slug) {
  const explicit = extractField(readme, 'Domain');
  if (explicit) return normalizeDomain(explicit);
  const hay = `${slug} ${readme?.slice(0, 600) ?? ''}`;
  for (const rule of DOMAIN_RULES) if (rule.match.test(hay)) return rule.domain;
  return 'unknown';
}

function normalizeDomain(raw) {
  const r = raw.toLowerCase();
  for (const rule of DOMAIN_RULES) if (rule.match.test(r)) return rule.domain;
  return r.split(/[\s/,]+/)[0] || 'unknown';
}

function pickStatus(readme, stateJson) {
  if (stateJson?.status) return stateJson.status.toLowerCase();
  const explicit = extractField(readme, 'Status');
  if (!explicit) return 'unknown';
  const s = explicit.toLowerCase();
  const known = Object.keys(STATUS_COLORS);
  for (const k of known) if (s.includes(k)) return k;
  return 'unknown';
}

function pickPriority(readme, stateJson) {
  if (stateJson?.priority) return stateJson.priority.toLowerCase();
  const explicit = extractField(readme, 'Priority');
  if (!explicit) return 'medium';
  const s = explicit.toLowerCase();
  if (s.includes('high')) return 'high';
  if (s.includes('low')) return 'low';
  return 'medium';
}

function extractTags(readme) {
  if (!readme) return [];
  const line = extractField(readme, 'Tags');
  if (!line) return [];
  return line
    .split(/[,;]/)
    .map((t) => t.replace(/[`#]/g, '').trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

/* ----- Sub-dashboard detection ----- */
const DASHBOARD_HINTS = [
  { dir: 'dashboard', label: 'Dashboard' },
  { dir: 'dashboard-app', label: 'Dashboard App' },
  { dir: 'dashboards', label: 'Dashboards' },
  { dir: 'viz', label: 'Viz' },
  { dir: 'ui', label: 'UI' },
  { dir: 'frontend', label: 'Frontend' },
  { dir: 'output', label: 'Outputs' },
  { dir: 'satellite-ground-station-viz', label: 'Ground Station Viz' },
  { dir: 'spacex-ipo-dashboard', label: 'SpaceX IPO Dashboard' },
  { dir: 'esrange-launch-economics', label: 'Esrange Launch Economics' }
];

async function detectSubDashboards(projectDir) {
  const found = [];
  // 1) Well-known folders
  for (const hint of DASHBOARD_HINTS) {
    const full = path.join(projectDir, hint.dir);
    if (!(await exists(full))) continue;
    const indexHtml = await findIndexHtml(full);
    const entry = indexHtml || full;
    found.push({
      label: hint.label,
      path: path.relative(WORKSPACE_ROOT, entry),
      absolute: entry,
      type: indexHtml ? 'html' : 'folder'
    });
  }
  // 2) Any *.html at project root
  try {
    const rootItems = await fs.readdir(projectDir, { withFileTypes: true });
    for (const it of rootItems) {
      if (it.isFile() && it.name.endsWith('.html')) {
        found.push({
          label: humanize(it.name.replace(/\.html$/, '')),
          path: path.relative(WORKSPACE_ROOT, path.join(projectDir, it.name)),
          absolute: path.join(projectDir, it.name),
          type: 'html'
        });
      }
    }
  } catch {
    /* ignore */
  }
  // 3) Any project.godot → native world
  const godot = path.join(projectDir, 'project.godot');
  if (await exists(godot)) {
    found.push({
      label: 'Godot World',
      path: path.relative(WORKSPACE_ROOT, godot),
      absolute: godot,
      type: 'godot'
    });
  }
  // Deduplicate by absolute path
  const seen = new Set();
  return found.filter((f) => {
    if (seen.has(f.absolute)) return false;
    seen.add(f.absolute);
    return true;
  });
}

async function findIndexHtml(dir) {
  // Direct index.html
  const direct = path.join(dir, 'index.html');
  if (await exists(direct)) return direct;
  // Nested one level
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const it of items) {
      if (it.isDirectory()) {
        const nested = path.join(dir, it.name, 'index.html');
        if (await exists(nested)) return nested;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

/* ----- Edges ----- */
function inferEdges(projects) {
  const edges = [];
  const byId = new Map(projects.map((p) => [p.id, p]));
  for (const p of projects) {
    // Connect to projects mentioned by slug in README
    if (!p._readme) continue;
    for (const other of projects) {
      if (other.id === p.id) continue;
      const tokens = [other.slug, other.slug.replace(/-/g, ' '), other.name];
      for (const t of tokens) {
        if (!t) continue;
        if (p._readme.toLowerCase().includes(t.toLowerCase())) {
          edges.push({ source: p.id, target: other.id, kind: 'mention' });
          break;
        }
      }
    }
    // Connect to same-domain projects with weak weight
  }
  // Add intra-domain ring edges so each cluster is visibly clustered
  const byDomain = new Map();
  for (const p of projects) {
    const arr = byDomain.get(p.domain) ?? [];
    arr.push(p);
    byDomain.set(p.domain, arr);
  }
  for (const arr of byDomain.values()) {
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      const b = arr[(i + 1) % arr.length];
      if (a.id === b.id) continue;
      edges.push({ source: a.id, target: b.id, kind: 'domain' });
    }
  }
  // De-dup
  const seen = new Set();
  return edges.filter((e) => {
    const key = [e.source, e.target].sort().join('::') + ':' + e.kind;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ----- Pulse ----- */
async function readPulse() {
  const pulse = [];
  const memoryDir = path.join(WORKSPACE_ROOT, 'memory');
  try {
    const files = await fs.readdir(memoryDir);
    const sorted = files
      .filter((f) => /^\d{4}-\d{2}-\d{2}/.test(f))
      .sort()
      .reverse()
      .slice(0, 6);
    for (const f of sorted) {
      const content = await safeRead(path.join(memoryDir, f));
      if (!content) continue;
      const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const firstBody =
        lines.find((l) => !l.startsWith('#') && !l.startsWith('---') && l.length > 10) ??
        lines[0] ??
        '';
      pulse.push({
        at: f.replace(/\.md$/, ''),
        title: f,
        summary: firstBody.slice(0, 180),
        type: 'memory'
      });
    }
  } catch {
    /* ignore */
  }
  const heartbeat = await safeRead(path.join(WORKSPACE_ROOT, 'HEARTBEAT.md'));
  if (heartbeat) {
    const title = heartbeat.split(/\r?\n/).find((l) => l.trim()) ?? 'Heartbeat';
    pulse.unshift({
      at: new Date().toISOString().slice(0, 10),
      title: 'Heartbeat',
      summary: title.replace(/^#+\s*/, '').slice(0, 180),
      type: 'heartbeat'
    });
  }
  return pulse;
}

/* ----- Second Brain Entities ----- */
async function readSecondBrainEntities() {
  const entitiesFile = path.join(WORKSPACE_ROOT, 'second-brain', 'system', 'entities.jsonl');
  try {
    const content = await safeRead(entitiesFile);
    if (!content) return null;
    const lines = content.trim().split('\n');
    const counts = new Map();
    for (const line of lines) {
      try {
        const e = JSON.parse(line);
        if (e.name && typeof e.mention_count === 'number') {
          counts.set(e.name, (counts.get(e.name) || 0) + e.mention_count);
        }
      } catch {
        /* skip malformed */
      }
    }
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    return top.length > 0 ? top : null;
  } catch {
    return null;
  }
}

/* ----- Main ----- */
async function scanProjects() {
  const entries = await fs.readdir(PROJECTS_ROOT, { withFileTypes: true });
  const projects = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    if (entry.name === 'openclaw-nova-hub') continue; // skip self

    const projectDir = path.join(PROJECTS_ROOT, entry.name);
    const readme = (await safeRead(path.join(projectDir, 'README.md'))) ?? '';
    const state = (await safeJson(path.join(projectDir, 'PROJECT_STATE.json'))) ?? null;
    const status = pickStatus(readme, state);
    const priority = pickPriority(readme, state);
    const domain = pickDomain(readme, entry.name);
    const tags = extractTags(readme);
    const oneLiner =
      state?.one_liner ||
      extractField(readme, 'One-liner') ||
      extractOneLiner(readme) ||
      `${humanize(entry.name)} — workspace`;
    const nextStep =
      state?.next_step || extractField(readme, 'Next Step') || extractField(readme, 'Next') || null;
    const currentFocus =
      state?.current_focus || extractField(readme, 'Current Focus') || null;
    const subDashboards = await detectSubDashboards(projectDir);
    const newest = await newestMtime(projectDir, 5); // Increased maxDepth for more thorough scanning
    const fileCount = await dirSize(projectDir, 4000, 5); // Added maxDepth for dirSize
    const queuePath = path.join(projectDir, 'QUEUE.md');
    const readmePathAbs = path.join(projectDir, 'README.md');
    const projectStatePathAbs = path.join(projectDir, 'PROJECT_STATE.json');
    const hasQueue = await exists(queuePath);
    const hasProjectState = await exists(projectStatePathAbs);
    const modifiedToday = newest ? isTodayLocal(newest) : false;

    projects.push({
      id: entry.name,
      slug: entry.name,
      name: humanize(entry.name),
      status,
      priority,
      domain,
      statusColor: STATUS_COLORS[status] ?? STATUS_COLORS.unknown,
      domainColor: DOMAIN_COLORS[domain] ?? DOMAIN_COLORS.unknown,
      oneLiner,
      currentFocus,
      nextStep,
      tags,
      lastUpdated: newest ? new Date(newest).toISOString() : null,
      fileCount,
      path: path.relative(WORKSPACE_ROOT, projectDir),
      absolutePath: projectDir,
      readmePath: path.relative(WORKSPACE_ROOT, readmePathAbs),
      hasReadme: readme.length > 0,
      hasQueue,
      queuePath: hasQueue ? path.relative(WORKSPACE_ROOT, queuePath) : null,
      hasProjectState,
      projectStatePath: hasProjectState ? path.relative(WORKSPACE_ROOT, projectStatePathAbs) : null,
      modifiedToday,
      safetyNotes: [
        subDashboards.some((d) => d.type === 'godot') ? 'native-runtime-present' : null,
        projectDir.includes('nova-avatar') ? 'validate-bridge-data-before-ui-exposure' : null,
        projectDir.includes('openclaw-nova-hub') ? 'frontend-data-must-remain-public-safe' : null
      ].filter(Boolean),
      subDashboards,
      _readme: readme // stripped later
    });
  }

  const edges = inferEdges(projects);
  const pulse = await readPulse();
  const secondBrain = await readSecondBrainEntities();

  // Strip helpers
  for (const p of projects) delete p._readme;

  return {
    generatedAt: new Date().toISOString(),
    workspaceRoot: WORKSPACE_ROOT,
    projectsRoot: PROJECTS_ROOT,
    projectCount: projects.length,
    domains: Object.keys(DOMAIN_COLORS),
    statusColors: STATUS_COLORS,
    domainColors: DOMAIN_COLORS,
    projects,
    edges,
    pulse,
    secondBrain
  };
}

async function main() {
  const data = await scanProjects();
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(data, null, 2));
  // Compact line for logs
  const sb = data.secondBrain?.length ? `${data.secondBrain.length} brain entities` : 'no brain';
  console.log(
    `[scan] ${data.projectCount} projects · ${data.edges.length} edges · ${data.pulse.length} pulse · ${sb} · → ${path.relative(HUB_ROOT, OUT_FILE)}`
  );
}

main().catch((err) => {
  console.error('[scan] failed:', err);
  process.exit(1);
});
