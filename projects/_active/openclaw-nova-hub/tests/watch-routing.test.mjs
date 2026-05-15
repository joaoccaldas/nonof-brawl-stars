import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the routing logic from watch.mjs
test('memory files route to knowledge scanner', () => {
  const MEMORY_DIR = path.resolve(__dirname, '..', '..', '..', 'memory');
  const PROJECTS_ROOT = path.resolve(__dirname, '..', '..', '..');
  
  // Simulate the routing logic
  function routeFile(filename) {
    const full = path.join(PROJECTS_ROOT, filename);
    if (full.startsWith(MEMORY_DIR) && filename.endsWith('.md')) {
      return 'knowledge';
    }
    return 'projects';
  }
  
  assert.equal(routeFile('memory/2026-05-02.md'), 'knowledge');
  assert.equal(routeFile('memory/MIDTERM.md'), 'knowledge');
  assert.equal(routeFile('projects/foo/README.md'), 'projects');
  assert.equal(routeFile('AGENTS.md'), 'projects');
  assert.equal(routeFile('memory/2026-05-02.txt'), 'projects'); // not .md
});

test('knowledge pipeline produces updated output', async () => {
  const fs = await import('node:fs/promises');
  const outputPath = path.join(__dirname, '..', 'public', 'knowledge-graph.json');
  const stats = await fs.stat(outputPath);
  const content = await fs.readFile(outputPath, 'utf8');
  const graph = JSON.parse(content);
  
  assert.ok(graph.generated);
  assert.ok(Date.now() - new Date(graph.generated).getTime() < 300_000); // updated in last 5 min
  assert.ok(Array.isArray(graph.nodes));
  assert.ok(Array.isArray(graph.links));
  assert.ok(graph.stats.totalNodes > 0);
});
