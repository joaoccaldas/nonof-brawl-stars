import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = '/Users/joao/.openclaw/workspace/projects/openclaw-nova-hub';
const outputPath = path.join(root, 'public', 'knowledge-graph.json');
const scriptPath = path.join(root, 'scripts', 'scan-knowledge-pipeline.mjs');

test('knowledge pipeline generates valid graph payload', async () => {
  await execFileAsync('node', [scriptPath], { cwd: root });
  const raw = await fs.readFile(outputPath, 'utf8');
  const graph = JSON.parse(raw);

  assert.ok(graph.generated);
  assert.ok(Array.isArray(graph.nodes));
  assert.ok(Array.isArray(graph.links));
  assert.ok(graph.stats.totalNodes > 0);
  assert.ok(graph.stats.filesScanned > 0);
  assert.ok(graph.nodes.some((node) => node.type === 'memory'));
  assert.ok(graph.nodes.some((node) => node.type === 'theme'));
  assert.ok(graph.links.some((link) => link.type === 'contains'));
});

test('deduplicates OpenClaw casing variants and scores relationships', async () => {
  const graph = JSON.parse(await fs.readFile(outputPath, 'utf8'));
  // Core entity should have canonical casing 'OpenClaw' (not 'openclaw' or 'OPENCLAW')
  const hasCanonicalOpenClaw = graph.nodes.some((node) => node.name === 'OpenClaw');
  assert.ok(hasCanonicalOpenClaw, 'Should have canonical "OpenClaw" entity');
  // No raw lowercase 'openclaw' or all-caps variants as standalone entities
  const badVariants = graph.nodes.filter((n) => n.name === 'openclaw' || n.name === 'OPENCLAW');
  assert.equal(badVariants.length, 0, 'Should not have lowercase or all-caps variants');
  // All links have valid strength scores
  assert.ok(graph.links.every((link) => typeof link.strength === 'number' && link.strength > 0 && link.strength <= 1));
});

test('emerging themes and unexpected connections are exposed', async () => {
  const graph = JSON.parse(await fs.readFile(outputPath, 'utf8'));
  assert.ok(Array.isArray(graph.emergingThemes));
  assert.ok(Array.isArray(graph.unexpectedConnections));
  assert.ok(graph.emergingThemes.length > 0);
  assert.ok(graph.unexpectedConnections.length > 0);
});

test('react integration points exist', async () => {
  const hook = await fs.readFile(path.join(root, 'src', 'lib', 'knowledgeGraph.js'), 'utf8');
  const component = await fs.readFile(path.join(root, 'src', 'components', 'KnowledgeGraph.jsx'), 'utf8');
  assert.match(hook, /useKnowledgeGraph/);
  assert.match(component, /useKnowledgeGraph/);
  assert.match(component, /emergingThemes/);
  assert.match(component, /unexpectedConnections/);
});
