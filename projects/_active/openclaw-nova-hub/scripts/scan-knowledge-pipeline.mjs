#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HUB_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.resolve(HUB_ROOT, '..', '..', '..');
const MEMORY_DIR = path.join(WORKSPACE_ROOT, 'memory');
const OUTPUT_FILE = path.join(HUB_ROOT, 'public', 'knowledge-graph.json');
const CACHE_FILE = path.join(HUB_ROOT, '.cache', 'knowledge-pipeline-cache.json');

const PERSON_ALIASES = new Map([
  ['joao', 'João'],
  ['joão', 'João'],
  ['supernova', 'Supernova'],
  ['nova', 'Nova'],
  ['openclaw', 'OpenClaw'],
  ['miele', 'Miele'],
  ['linn', 'Linn'],
  ['lukas', 'Lukas'],
  ['noah', 'Noah'],
]);

const STOPWORDS = new Set([
  'the','and','for','that','this','with','from','into','about','after','before','under','over','daily','summary','timeline','status','logged','candidate','possible','lasting','truths','conversation','session','source','confidence','evidence','recalls','staged','start','completed','progress','saturday','sunday','monday','tuesday','wednesday','thursday','friday','january','february','march','april','may','june','july','august','september','october','november','december','what','when','where','which','there','their','them','they','have','been','were','will','just','more','than','your','mine','ours','also','very','much','here','some','only','like','because','while','through','across','using','used','todo','note','notes','file','files','project','projects','memory','memories'
]);

const POSITIVE_WORDS = ['completed','restored','healthy','success','successful','improved','launched','created','verified','working','active','ready','approved','connected','delivered','stable','progress'];
const NEGATIVE_WORDS = ['failed','broken','error','issue','blocked','outage','drifted','interrupted','crashed','worry','stuck','timeout','problem','degraded','risk'];
const HIGH_INTENSITY_WORDS = ['critical','urgent','important','breakthrough','major','huge','irreversible','absolute'];
const LOW_INTENSITY_WORDS = ['maybe','minor','small','slight','quiet'];
const ORG_HINTS = ['inc','llc','corp','gmbh','ltd','ab','nordics','workspace','team','company'];
const PROJECT_HINTS = ['hub','dashboard','pipeline','workflow','system','project','bridge','avatar','brain','graph','automation','ingest','ingestion'];
const EVENT_HINTS = ['session','meeting','review','heartbeat','outage','launch','contact','refresh','incident','cron'];

async function safeRead(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function safeJson(filePath, fallback = null) {
  const raw = await safeRead(filePath);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function hashContent(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function canonicalLabel(value) {
  const trimmed = String(value || '').replace(/[`*_#>-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  const alias = PERSON_ALIASES.get(trimmed.toLowerCase());
  if (alias) return alias;
  return trimmed
    .split(' ')
    .map((token) => token.length <= 3 ? token.toUpperCase() : token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ')
    .replace(/\bFp&A\b/i, 'FP&A')
    .replace(/\bAi\b/g, 'AI');
}

function normalizeEntityKey(value) {
  return slugify(canonicalLabel(value));
}

function parseFrontDate(fileName) {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  return match[1];
}

function extractTimeMentions(text, baseDate) {
  const mentions = [];
  const timeRanges = [...text.matchAll(/(\d{1,2}:\d{2})(?:\s*[-–]\s*(\d{1,2}:\d{2}))?/g)];
  for (const match of timeRanges) {
    mentions.push({
      label: match[0],
      timestamp: baseDate ? `${baseDate}T${match[1].padStart(5, '0')}:00` : null,
      endTimestamp: baseDate && match[2] ? `${baseDate}T${match[2].padStart(5, '0')}:00` : null,
    });
  }
  return mentions.slice(0, 30);
}

function sentimentFromText(text) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const word of POSITIVE_WORDS) if (lower.includes(word)) score += 1;
  for (const word of NEGATIVE_WORDS) if (lower.includes(word)) score -= 1;
  const intensityBoost = HIGH_INTENSITY_WORDS.reduce((n, word) => n + (lower.includes(word) ? 1 : 0), 0);
  const intensityDamp = LOW_INTENSITY_WORDS.reduce((n, word) => n + (lower.includes(word) ? 1 : 0), 0);
  const intensity = Math.max(0.1, Math.min(1, 0.35 + intensityBoost * 0.15 + Math.min(Math.abs(score), 4) * 0.1 - intensityDamp * 0.08));
  const tone = score > 1 ? 'positive' : score < -1 ? 'negative' : 'neutral';
  return { score, tone, intensity: Number(intensity.toFixed(2)) };
}

function classifyEntity(label, context = '') {
  const lower = label.toLowerCase();
  const ctx = context.toLowerCase();
  if (PERSON_ALIASES.has(lower) || /^[A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+){0,2}$/.test(label) && !lower.includes('session')) return 'person';
  if (ORG_HINTS.some((hint) => lower.includes(hint))) return 'organization';
  if (PROJECT_HINTS.some((hint) => lower.includes(hint)) || ctx.includes('project')) return 'project';
  if (EVENT_HINTS.some((hint) => lower.includes(hint)) || ctx.includes('timeline') || ctx.includes('completed')) return 'event';
  return 'concept';
}

function keywordCandidates(text) {
  const counts = new Map();
  const cleaned = text
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\b\d{1,2}:\d{2}\b/g, ' ')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ');
  const phrases = cleaned.match(/\b[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9/&+-]{2,}(?:\s+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9/&+-]{2,}){0,2}\b/g) || [];
  for (const phrase of phrases) {
    const raw = phrase.trim().replace(/\s+/g, ' ');
    const lower = raw.toLowerCase();
    const tokens = lower.split(' ');
    if (tokens.every((token) => STOPWORDS.has(token))) continue;
    if (tokens.length === 1 && (STOPWORDS.has(lower) || lower.length < 4)) continue;
    if (/^(candidate|confidence|evidence|status)$/i.test(raw)) continue;
    counts.set(raw, (counts.get(raw) || 0) + 1);
  }
  return counts;
}

function extractMarkdownSections(content) {
  const sections = [];
  const lines = content.split(/\r?\n/);
  let current = { heading: 'Document', depth: 0, lines: [] };
  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      if (current.lines.length || current.heading !== 'Document') sections.push(current);
      current = { heading: headingMatch[2].trim(), depth: headingMatch[1].length, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections;
}

function extractExplicitEntities(sectionHeading, text) {
  const entities = [];
  const heading = canonicalLabel(sectionHeading);
  if (heading && heading !== 'Document' && heading.length > 2) {
    entities.push({ label: heading, type: classifyEntity(heading, sectionHeading), source: 'heading' });
  }

  const bulletEntities = [...text.matchAll(/^[-*]\s+\*\*(.+?)\*\*/gm)];
  for (const match of bulletEntities) {
    const label = canonicalLabel(match[1]);
    if (label && label.length > 2) entities.push({ label, type: classifyEntity(label, text), source: 'emphasis' });
  }

  const inlineCode = [...text.matchAll(/`([^`]{3,80})`/g)];
  for (const match of inlineCode) {
    const label = canonicalLabel(match[1]);
    if (/[a-z]/i.test(label)) entities.push({ label, type: classifyEntity(label, text), source: 'code' });
  }

  const titled = [...text.matchAll(/\b([A-ZÀ-ÿ][\wÀ-ÿ&+.-]+(?:\s+[A-ZÀ-ÿ][\wÀ-ÿ&+.-]+){0,2})\b/g)];
  for (const match of titled) {
    const label = canonicalLabel(match[1]);
    if (label.length > 2) entities.push({ label, type: classifyEntity(label, text), source: 'title' });
  }

  return entities;
}

function parseMemoryFile(fileName, content, stat) {
  const baseDate = parseFrontDate(fileName);
  const sections = extractMarkdownSections(content);
  const keywordCounts = keywordCandidates(content);
  const conceptCounts = new Map();
  const entityMap = new Map();
  const relationships = [];
  const events = [];
  const timeline = extractTimeMentions(content, baseDate);
  const sentiment = sentimentFromText(content);

  function upsertEntity(entry) {
    const label = canonicalLabel(entry.label);
    if (!label || label.length < 2) return null;
    const key = normalizeEntityKey(label);
    const prev = entityMap.get(key);
    const mentions = (prev?.mentions || 0) + 1;
    const merged = {
      key,
      id: `entity-${key}`,
      name: label,
      type: prev?.type === 'person' ? prev.type : (entry.type || prev?.type || 'concept'),
      mentions,
      firstSeen: prev?.firstSeen || baseDate,
      lastSeen: baseDate || prev?.lastSeen || null,
      sources: [...new Set([...(prev?.sources || []), entry.source || 'derived'])],
    };
    entityMap.set(key, merged);
    return merged;
  }

  for (const [phrase, count] of keywordCounts.entries()) {
    if (count < 2 && phrase.split(' ').length === 1) continue;
    const label = canonicalLabel(phrase);
    if (!label || label.length < 3) continue;
    conceptCounts.set(label, count);
  }

  for (const section of sections) {
    const sectionText = section.lines.join('\n').trim();
    const explicit = extractExplicitEntities(section.heading, sectionText);
    const currentEntities = [];
    for (const item of explicit) {
      const entity = upsertEntity(item);
      if (entity) currentEntities.push(entity);
    }

    const conceptMatches = [...conceptCounts.entries()]
      .filter(([label]) => sectionText.toLowerCase().includes(label.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    for (const [label] of conceptMatches) {
      const entity = upsertEntity({ label, type: classifyEntity(label, sectionText), source: 'keyword' });
      if (entity) currentEntities.push(entity);
    }

    const deduped = [...new Map(currentEntities.map((entity) => [entity.key, entity])).values()];
    for (let i = 0; i < deduped.length; i += 1) {
      for (let j = i + 1; j < deduped.length; j += 1) {
        const source = deduped[i];
        const target = deduped[j];
        const sectionWeight = Math.min(1, 0.22 + (section.depth === 1 ? 0.18 : 0.08) + Math.min(sectionText.length / 1600, 0.3));
        relationships.push({
          source: source.id,
          target: target.id,
          type: source.type === 'person' && target.type === 'person' ? 'co_occurs' : 'relates',
          strength: Number(sectionWeight.toFixed(2)),
          context: section.heading,
          date: baseDate,
        });
      }
    }

    if (section.heading !== 'Document') {
      events.push({
        id: `event-${slugify(fileName + '-' + section.heading)}`,
        name: canonicalLabel(section.heading),
        section: section.heading,
        summary: sectionText.split('\n').find((line) => line.trim())?.trim() || '',
        date: baseDate,
        sentiment: sentimentFromText(`${section.heading}\n${sectionText}`),
        timeMentions: extractTimeMentions(sectionText, baseDate),
      });
    }
  }

  const topConcepts = [...conceptCounts.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, count]) => ({ label, count, key: normalizeEntityKey(label) }));

  return {
    id: `memory-${slugify(fileName.replace(/\.md$/, ''))}`,
    fileName,
    path: path.join(MEMORY_DIR, fileName),
    title: canonicalLabel(fileName.replace(/\.md$/, '').replace(/-/g, ' ')),
    date: baseDate,
    modifiedAt: stat.mtime.toISOString(),
    hash: hashContent(content),
    sentiment,
    intensity: sentiment.intensity,
    timeline,
    entities: [...entityMap.values()],
    concepts: topConcepts,
    relationships,
    events,
    summary: sections.find((section) => /summary/i.test(section.heading))?.lines.join(' ').trim().slice(0, 260) || '',
  };
}

function aggregateMemoryData(parsedFiles) {
  const entityAggregate = new Map();
  const linkAggregate = new Map();
  const themeTimeline = new Map();
  const memoryNodes = [];
  const eventNodes = [];

  for (const file of parsedFiles) {
    memoryNodes.push({
      id: file.id,
      name: file.title,
      type: 'memory',
      status: 'active',
      path: file.path,
      lastAccessed: file.modifiedAt,
      date: file.date,
      sentiment: file.sentiment,
      intensity: file.intensity,
      summary: file.summary,
      timeline: file.timeline,
      entities: file.entities.map((entity) => entity.name),
      concepts: file.concepts.map((concept) => concept.label),
      metrics: {
        entityCount: file.entities.length,
        relationshipCount: file.relationships.length,
        eventCount: file.events.length,
      },
    });

    for (const entity of file.entities) {
      const existing = entityAggregate.get(entity.key);
      entityAggregate.set(entity.key, {
        ...entity,
        mentions: (existing?.mentions || 0) + entity.mentions,
        files: [...new Set([...(existing?.files || []), file.fileName])],
        firstSeen: existing?.firstSeen && existing.firstSeen < entity.firstSeen ? existing.firstSeen : entity.firstSeen,
        lastSeen: entity.lastSeen || existing?.lastSeen || null,
      });
    }

    for (const rel of file.relationships.slice(0, 800)) {
      const ordered = [rel.source, rel.target].sort();
      const key = `${ordered[0]}::${ordered[1]}::${rel.type}`;
      const existing = linkAggregate.get(key);
      linkAggregate.set(key, {
        source: ordered[0],
        target: ordered[1],
        type: rel.type,
        strength: Number(Math.min(1, (existing?.strength || 0) + rel.strength).toFixed(2)),
        occurrences: (existing?.occurrences || 0) + 1,
        contexts: [...new Set([...(existing?.contexts || []), rel.context])],
        dates: [...new Set([...(existing?.dates || []), rel.date].filter(Boolean))],
      });
    }

    for (const concept of file.concepts) {
      const arr = themeTimeline.get(concept.key) || [];
      arr.push({ date: file.date, count: concept.count, file: file.fileName });
      themeTimeline.set(concept.key, arr);
    }

    for (const event of file.events.slice(0, 8)) {
      eventNodes.push({
        id: event.id,
        name: event.name,
        type: 'event',
        status: 'active',
        date: event.date,
        lastAccessed: file.modifiedAt,
        parentMemoryId: file.id,
        summary: event.summary,
        sentiment: event.sentiment,
        timeline: event.timeMentions,
      });
      linkAggregate.set(`${file.id}::${event.id}::contains`, {
        source: file.id,
        target: event.id,
        type: 'contains',
        strength: 0.72,
        occurrences: 1,
        contexts: [event.section],
        dates: [file.date].filter(Boolean),
      });
    }
  }

  const entityNodes = [...entityAggregate.values()].map((entity) => ({
    id: entity.id,
    name: entity.name,
    type: entity.type,
    status: 'active',
    firstSeen: entity.firstSeen,
    lastSeen: entity.lastSeen,
    mentions: entity.mentions,
    fileCount: entity.files.length,
    lastAccessed: entity.lastSeen ? `${entity.lastSeen}T00:00:00` : null,
    aliases: entity.sources,
  }));

  const themeNodes = [...themeTimeline.entries()].map(([key, entries]) => {
    const sorted = entries.filter((entry) => entry.date).sort((a, b) => a.date.localeCompare(b.date));
    const totalMentions = entries.reduce((sum, entry) => sum + entry.count, 0);
    const recent = sorted.slice(-3).reduce((sum, entry) => sum + entry.count, 0);
    const baselineEntries = sorted.slice(0, Math.max(1, sorted.length - 3));
    const baseline = baselineEntries.length ? baselineEntries.reduce((sum, entry) => sum + entry.count, 0) / baselineEntries.length : 0;
    const momentum = Number((recent - baseline).toFixed(2));
    const label = sorted[sorted.length - 1]?.file ? null : null;
    const nodeName = entityAggregate.get(key)?.name || key.split('-').map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join(' ');
    return {
      id: `theme-${key}`,
      key,
      name: nodeName,
      type: 'theme',
      status: momentum > 1 ? 'emerging' : 'active',
      mentions: totalMentions,
      momentum,
      timeline: sorted,
      lastAccessed: sorted.at(-1)?.date ? `${sorted.at(-1).date}T00:00:00` : null,
    };
  }).filter((node) => node.mentions >= 2);

  for (const themeNode of themeNodes) {
    const entityId = `entity-${themeNode.key}`;
    if (entityAggregate.has(themeNode.key)) {
      linkAggregate.set(`${themeNode.id}::${entityId}::amplifies`, {
        source: themeNode.id,
        target: entityId,
        type: 'amplifies',
        strength: Number(Math.min(1, 0.4 + Math.max(0, themeNode.momentum) * 0.1).toFixed(2)),
        occurrences: themeNode.mentions,
        contexts: ['theme-momentum'],
        dates: themeNode.timeline.map((entry) => entry.date).filter(Boolean),
      });
    }
  }

  const allNodes = [...memoryNodes, ...entityNodes, ...eventNodes, ...themeNodes];
  const links = [...linkAggregate.values()].map((link) => ({
    ...link,
    strength: Number(Math.min(1, link.strength).toFixed(2)),
  }));

  const unexpectedConnections = links
    .filter((link) => link.occurrences >= 2 && !['contains'].includes(link.type))
    .sort((a, b) => (b.strength * b.occurrences) - (a.strength * a.occurrences))
    .slice(0, 8)
    .map((link) => ({
      source: allNodes.find((node) => node.id === link.source)?.name || link.source,
      target: allNodes.find((node) => node.id === link.target)?.name || link.target,
      strength: link.strength,
      contexts: link.contexts.slice(0, 3),
      occurrences: link.occurrences,
    }));

  const emergingThemes = themeNodes
    .filter((node) => node.momentum > 0)
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 12)
    .map((node) => ({
      id: node.id,
      name: node.name,
      mentions: node.mentions,
      momentum: node.momentum,
      latestDate: node.timeline.at(-1)?.date || null,
    }));

  return {
    generated: new Date().toISOString(),
    stats: {
      totalNodes: allNodes.length,
      memories: memoryNodes.length,
      entities: entityNodes.length,
      events: eventNodes.length,
      themes: themeNodes.length,
      links: links.length,
      filesScanned: parsedFiles.length,
    },
    nodes: allNodes,
    links,
    emergingThemes,
    unexpectedConnections,
    timeline: parsedFiles
      .map((file) => ({ date: file.date, memoryId: file.id, intensity: file.intensity, sentiment: file.sentiment.tone }))
      .filter((entry) => entry.date)
      .sort((a, b) => a.date.localeCompare(b.date)),
    sourceInfo: {
      memoryDir: MEMORY_DIR,
      incremental: true,
      cacheFile: CACHE_FILE,
    },
  };
}

async function collectMemoryFiles() {
  const entries = await fs.readdir(MEMORY_DIR, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    if (!/^\d{4}-\d{2}-\d{2}/.test(entry.name)) continue;
    const filePath = path.join(MEMORY_DIR, entry.name);
    const stat = await fs.stat(filePath);
    files.push({ fileName: entry.name, filePath, stat });
  }
  return files.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

async function main() {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  const cache = await safeJson(CACHE_FILE, { files: {}, graph: null });
  const files = await collectMemoryFiles();
  const parsedFiles = [];
  let reparsed = 0;

  for (const file of files) {
    const content = await safeRead(file.filePath);
    if (content == null) continue;
    const hash = hashContent(content);
    const cached = cache.files[file.fileName];
    if (cached?.hash === hash && cached?.parsed) {
      parsedFiles.push(cached.parsed);
      continue;
    }
    const parsed = parseMemoryFile(file.fileName, content, file.stat);
    cache.files[file.fileName] = {
      hash,
      parsed: {
        ...parsed,
        relationships: parsed.relationships.slice(0, 800),
        events: parsed.events.slice(0, 40),
      },
    };
    parsedFiles.push(cache.files[file.fileName].parsed);
    reparsed += 1;
  }

  for (const cachedName of Object.keys(cache.files)) {
    if (!files.find((file) => file.fileName === cachedName)) delete cache.files[cachedName];
  }

  const graph = aggregateMemoryData(parsedFiles);
  cache.graph = {
    generated: graph.generated,
    stats: graph.stats,
    reparsed,
    fileCount: parsedFiles.length,
  };

  const compactCache = { files: {}, graph: cache.graph };
  for (const [name, entry] of Object.entries(cache.files)) {
    compactCache.files[name] = {
      hash: entry.hash,
      parsed: {
        id: entry.parsed.id,
        fileName: entry.parsed.fileName,
        title: entry.parsed.title,
        date: entry.parsed.date,
        modifiedAt: entry.parsed.modifiedAt,
        hash: entry.parsed.hash,
        sentiment: entry.parsed.sentiment,
        intensity: entry.parsed.intensity,
        timeline: entry.parsed.timeline,
        entities: entry.parsed.entities,
        concepts: entry.parsed.concepts,
        relationships: entry.parsed.relationships.slice(0, 300),
        events: entry.parsed.events.slice(0, 20),
        summary: entry.parsed.summary,
      },
    };
  }
  await fs.writeFile(CACHE_FILE, JSON.stringify(compactCache, null, 2));
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(graph, null, 2));

  console.log(`[knowledge-pipeline] ${graph.stats.filesScanned} files · ${graph.stats.totalNodes} nodes · ${graph.stats.links} links · reparsed ${reparsed}`);
}

main().catch((error) => {
  console.error('[knowledge-pipeline] failed:', error);
  process.exit(1);
});
