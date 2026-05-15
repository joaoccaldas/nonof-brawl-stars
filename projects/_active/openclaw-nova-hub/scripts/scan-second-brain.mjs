import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HUB_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.resolve(HUB_ROOT, '../..');
const SECOND_BRAIN_ENTITIES = path.join(WORKSPACE_ROOT, 'second-brain', 'system', 'entities.jsonl');
const OUTPUT_FILE = path.join(HUB_ROOT, 'public', 'second-brain.json');

async function main() {
  console.log(`[scan-second-brain] Reading ${SECOND_BRAIN_ENTITIES}...`);
  try {
    const data = await fs.readFile(SECOND_BRAIN_ENTITIES, 'utf-8');
    const lines = data.split('\n').filter(l => l.trim() !== '');
    
    const entities = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (err) {
        return null;
      }
    }).filter(e => e !== null);

    // Sort by mention_count descending
    entities.sort((a, b) => (b.mention_count || 0) - (a.mention_count || 0));

    const stats = {
      total: entities.length,
      people: entities.filter(e => e.type === 'person').length,
      concepts: entities.filter(e => e.type === 'concept').length,
      projects: entities.filter(e => e.type === 'project').length,
    };

    const output = {
      lastUpdated: new Date().toISOString(),
      stats,
      entities
    };

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`[scan-second-brain] Wrote ${entities.length} entities to ${OUTPUT_FILE}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`[scan-second-brain] Entities file not found: ${SECOND_BRAIN_ENTITIES}. Skipping.`);
      await fs.writeFile(OUTPUT_FILE, JSON.stringify({ lastUpdated: new Date().toISOString(), stats: {}, entities: [] }, null, 2));
    } else {
      console.error(`[scan-second-brain] Error processing entities:`, err);
    }
  }
}

main().catch(console.error);
