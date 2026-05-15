#!/usr/bin/env node
/**
 * scan-knowledge-graph.mjs — Scan memory/, projects/, knowledge/ and generate graph data
 * Run: node scripts/scan-knowledge-graph.mjs
 */

import fs from 'fs/promises';
import path from 'path';

const WORKSPACE_DIR = path.join(process.env.HOME || '/Users/joao', '.openclaw', 'workspace');
const MEMORY_DIR = path.join(WORKSPACE_DIR, 'memory');
const PROJECTS_DIR = path.join(WORKSPACE_DIR, 'projects');
const KNOWLEDGE_DIR = path.join(WORKSPACE_DIR, 'knowledge');
const INBOX_DIR = path.join(WORKSPACE_DIR, 'inbox');

const OUTPUT_FILE = path.join(process.cwd(), 'public', 'knowledge-graph.json');

// Extract names/entities from text
function extractEntities(text) {
  const entities = new Set();
  
  // People names (capitalized words that look like names)
  const namePattern = /\b[A-Z][a-z]+\s+(?:[A-Z][a-z]+\s+)?[A-Z][a-z]+\b/g;
  const matches = text.match(namePattern) || [];
  matches.forEach(m => {
    // Filter out common false positives
    const skip = ['The', 'This', 'That', 'These', 'Those', 'From', 'With', 'Have', 'Been', 'Being'];
    if (!skip.some(s => m.startsWith(s))) {
      entities.add(m);
    }
  });
  
  return Array.from(entities);
}

// Extract topics/concepts
function extractConcepts(text) {
  const concepts = new Set();
  
  // Markdown headers
  const headerMatches = text.match(/^#{1,3}\s+(.+)$/gm) || [];
  headerMatches.forEach(h => {
    const concept = h.replace(/^#+\s+/, '').trim();
    if (concept.length > 3 && concept.length < 50) {
      concepts.add(concept);
    }
  });
  
  // Bold/italic emphasis
  const boldMatches = text.match(/\*\*([^*]+)\*\*/g) || [];
  boldMatches.forEach(b => {
    const concept = b.replace(/\*\*/g, '').trim();
    if (concept.length > 3 && concept.length < 40) {
      concepts.add(concept);
    }
  });
  
  return Array.from(concepts).slice(0, 20); // Limit to top 20
}

async function scanDirectory(dir, type) {
  const nodes = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Project folder
        if (type === 'project') {
          const projectPath = path.join(dir, entry.name);
          const stat = await fs.stat(projectPath);
          
          // Check for project state
          let status = 'active';
          try {
            const statePath = path.join(projectPath, 'PROJECT_STATE.json');
            const state = JSON.parse(await fs.readFile(statePath, 'utf-8'));
            status = state.status || 'active';
          } catch (e) {
            // No state file
          }
          
          nodes.push({
            id: `project-${entry.name}`,
            name: entry.name.replace(/-/g, ' ').replace(/_/g, ' '),
            type: 'project',
            status,
            path: projectPath,
            lastAccessed: stat.mtime.toISOString()
          });
        }
      } else if (entry.isFile()) {
        const filePath = path.join(dir, entry.name);
        const stat = await fs.stat(filePath);
        const ext = path.extname(entry.name).toLowerCase();
        
        if (ext === '.md') {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const entities = extractEntities(content);
            const concepts = extractConcepts(content);
            
            // Determine memory type from filename
            let memoryType = 'memory';
            if (entry.name.includes('TODO')) memoryType = 'task';
            if (entry.name.includes('MEETING') || entry.name.includes('meeting')) memoryType = 'meeting';
            if (entry.name.includes('DECISION') || entry.name.includes('decision')) memoryType = 'decision';
            
            const node = {
              id: `memory-${entry.name.replace('.md', '')}`,
              name: entry.name.replace('.md', '').replace(/-/g, ' '),
              type: memoryType,
              status: 'active',
              path: filePath,
              lastAccessed: stat.mtime.toISOString(),
              entities,
              concepts: concepts.slice(0, 10)
            };
            
            nodes.push(node);
            
            // Add extracted concepts as concept nodes
            concepts.slice(0, 5).forEach((concept, i) => {
              nodes.push({
                id: `concept-${concept.toLowerCase().replace(/\s+/g, '-')}`,
                name: concept,
                type: 'concept',
                status: 'active',
                sourceFile: entry.name,
                lastAccessed: stat.mtime.toISOString()
              });
            });
            
          } catch (e) {
            // Skip files that can't be read
          }
        }
      }
    }
  } catch (e) {
    // Directory doesn't exist
  }
  
  return nodes;
}

async function generateGraph() {
  console.log('Scanning knowledge sources...');
  
  // Scan all sources
  const memoryNodes = await scanDirectory(MEMORY_DIR, 'memory');
  const projectNodes = await scanDirectory(PROJECTS_DIR, 'project');
  const knowledgeNodes = await scanDirectory(KNOWLEDGE_DIR, 'knowledge');
  
  // Combine and deduplicate
  const allNodes = [...memoryNodes, ...projectNodes, ...knowledgeNodes];
  const uniqueNodes = [];
  const seenIds = new Set();
  
  for (const node of allNodes) {
    if (!seenIds.has(node.id)) {
      seenIds.add(node.id);
      uniqueNodes.push(node);
    }
  }
  
  // Generate links based on relationships
  const links = [];
  const memoryNodes2 = uniqueNodes.filter(n => n.type === 'memory' || n.type === 'meeting' || n.type === 'task');
  const projectNodes2 = uniqueNodes.filter(n => n.type === 'project');
  const conceptNodes = uniqueNodes.filter(n => n.type === 'concept');
  
  // Link projects to related memories
  memoryNodes2.forEach(memory => {
    const memoryName = memory.name.toLowerCase();
    projectNodes2.forEach(project => {
      const projectName = project.name.toLowerCase();
      if (memoryName.includes(projectName) || projectName.includes(memoryName.split(' ')[0])) {
        links.push({
          source: project.id,
          target: memory.id,
          type: 'contains',
          strength: 0.7
        });
      }
    });
  });
  
  // Link concepts to their source memories
  conceptNodes.forEach(concept => {
    if (concept.sourceFile) {
      const sourceId = `memory-${concept.sourceFile.replace('.md', '')}`;
      if (seenIds.has(sourceId)) {
        links.push({
          source: sourceId,
          target: concept.id,
          type: 'references',
          strength: 0.6
        });
      }
    }
  });
  
  // Link related concepts
  conceptNodes.forEach((c1, i) => {
    conceptNodes.slice(i + 1).forEach(c2 => {
      const words1 = c1.name.toLowerCase().split(' ');
      const words2 = c2.name.toLowerCase().split(' ');
      if (words1.some(w => words2.includes(w) && w.length > 3)) {
        links.push({
          source: c1.id,
          target: c2.id,
          type: 'relates',
          strength: 0.5
        });
      }
    });
  });
  
  // Add some default nodes if empty
  if (uniqueNodes.length === 0) {
    uniqueNodes.push(
      { id: 'welcome', name: 'Welcome', type: 'concept', status: 'active', lastAccessed: Date.now() },
      { id: 'start', name: 'Start Here', type: 'memory', status: 'active', lastAccessed: Date.now() }
    );
    links.push({ source: 'welcome', target: 'start', type: 'relates', strength: 0.8 });
  }
  
  const output = {
    generated: new Date().toISOString(),
    stats: {
      totalNodes: uniqueNodes.length,
      projects: uniqueNodes.filter(n => n.type === 'project').length,
      memories: uniqueNodes.filter(n => ['memory', 'meeting', 'task', 'decision'].includes(n.type)).length,
      concepts: uniqueNodes.filter(n => n.type === 'concept').length,
      links: links.length
    },
    nodes: uniqueNodes,
    links
  };
  
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log(`✓ Generated knowledge graph`);
  console.log(`  Nodes: ${output.stats.totalNodes}`);
  console.log(`    - Projects: ${output.stats.projects}`);
  console.log(`    - Memories: ${output.stats.memories}`);
  console.log(`    - Concepts: ${output.stats.concepts}`);
  console.log(`  Links: ${output.stats.links}`);
  console.log(`\n✓ Written to ${OUTPUT_FILE}`);
}

generateGraph().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
