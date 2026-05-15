#!/usr/bin/env node
/**
 * generate-nexus-data.mjs — Curates a "useful" dataset for the Nexus visualization.
 * Filters out noise (generic words) and focuses on actionable entities:
 * Contacts, Projects, Missions, and key Codebase modules.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const HUB_ROOT = process.cwd();
const PUBLIC_DIR = path.join(HUB_ROOT, 'public');

async function safeJson(p) {
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const projectsData = await safeJson(path.join(PUBLIC_DIR, 'projects.json'));
  const contactsData = await safeJson(path.join(PUBLIC_DIR, 'contacts.json'));
  const codebaseData = await safeJson(path.join(PUBLIC_DIR, 'codebase-graph.json'));
  const secondBrainData = await safeJson(path.join(PUBLIC_DIR, 'second-brain.json'));

  if (!projectsData) {
    console.error('Projects data missing. Run npm run scan first.');
    return;
  }

  const nodes = [];
  const links = [];

  // 1. PROJECTS (The primary anchors)
  projectsData.projects.forEach(p => {
    nodes.push({
      id: `proj-${p.id}`,
      name: p.name,
      type: 'project',
      status: p.status,
      domain: p.domain,
      color: p.domainColor,
      val: p.priority === 'high' ? 20 : 12,
      data: p
    });
  });

  // 2. CONTACTS (The human layer)
  if (contactsData) {
    contactsData.contacts.forEach(c => {
      nodes.push({
        id: `contact-${c.name}`,
        name: c.name,
        type: 'contact',
        role: c.role,
        priority: c.priority,
        val: c.priority === 'high' ? 15 : 8,
        color: '#bcd6ff'
      });

      // Link contacts to projects they are mentioned in or related to
      // (Using simple heuristics from tags or mentions)
      projectsData.projects.forEach(p => {
        if (p.tags?.some(t => c.tags?.includes(t)) || p.name.toLowerCase().includes(c.name.toLowerCase())) {
          links.push({
            source: `contact-${c.name}`,
            target: `proj-${p.id}`,
            type: 'involvement',
            strength: 0.5
          });
        }
      });
    });
  }

  // 3. CODEBASE (Key modules only, avoid hairball)
  if (codebaseData) {
    const keyFiles = codebaseData.nodes
      .filter(f => f.size > 5000 || f.name === 'main.js' || f.name === 'App.jsx' || f.name.includes('server'))
      .slice(0, 150); // Cap at 150 important files

    keyFiles.forEach(f => {
      nodes.push({
        id: `file-${f.id}`,
        name: f.name,
        type: 'file',
        project: f.project,
        size: f.size,
        val: 4,
        color: '#46e0ff'
      });

      // Link file to its project
      links.push({
        source: `file-${f.id}`,
        target: `proj-${f.project}`,
        type: 'containment',
        strength: 0.8
      });
    });

    // Add important internal links
    codebaseData.links.forEach(l => {
      if (nodes.find(n => n.id === `file-${l.source}`) && nodes.find(n => n.id === `file-${l.target}`)) {
        links.push({
          source: `file-${l.source}`,
          target: `file-${l.target}`,
          type: 'import',
          strength: 0.3
        });
      }
    });
  }

  // 4. KNOWLEDGE (Curated concepts only)
  if (secondBrainData) {
    const usefulEntities = secondBrainData.entities
      .filter(e => 
        (e.type === 'project' || e.type === 'person') && 
        e.mention_count > 5 &&
        !['joao', 'nova'].includes(e.id) // Skip self/system as they link to everything
      )
      .slice(0, 50);

    usefulEntities.forEach(e => {
      // Avoid duplicates if already added as project/contact
      if (nodes.find(n => n.id === `proj-${e.id}` || n.id === `contact-${e.name}`)) return;

      nodes.push({
        id: `entity-${e.id}`,
        name: e.name,
        type: 'knowledge',
        val: 6,
        color: '#a45bff'
      });
    });
  }

  const nexusData = {
    generatedAt: new Date().toISOString(),
    nodes,
    links
  };

  await fs.writeFile(path.join(PUBLIC_DIR, 'nexus-data.json'), JSON.stringify(nexusData, null, 2));
  console.log(`[nexus-gen] ${nodes.length} nodes · ${links.length} links → nexus-data.json`);
}

main().catch(console.error);
