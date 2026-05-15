#!/usr/bin/env node
/**
 * scan-codebase-graph.mjs — scans the projects in the workspace,
 * builds a graph of files and their imports.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUB_ROOT = path.resolve(__dirname, '..');
const PROJECTS_ROOT = path.resolve(HUB_ROOT, '..');
const OUTPUT_FILE = path.join(HUB_ROOT, 'public', 'codebase-graph.json');

const IGNORE_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '.cache', 'tmp', 'pids', 'tests']);
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function scan() {
  const nodes = [];
  const links = [];
  const allFilesMap = new Map(); // path -> node
  const absoluteToRelative = new Map();

  async function walk(dir, projectSlug) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        await walk(fullPath, projectSlug);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (EXTENSIONS.has(ext)) {
          const relPath = path.relative(PROJECTS_ROOT, fullPath);
          const folder = path.relative(PROJECTS_ROOT, dir);
          const node = {
            id: relPath,
            name: entry.name,
            project: projectSlug,
            folder: folder,
            ext,
            size: (await fs.stat(fullPath)).size,
            type: ext === '.jsx' || ext === '.tsx' ? 'component' : 'module'
          };
          nodes.push(node);
          allFilesMap.set(relPath, node);
          absoluteToRelative.set(fullPath, relPath);
        }
      }
    }
  }

  // Scan all project directories
  const projects = await fs.readdir(PROJECTS_ROOT, { withFileTypes: true });
  for (const p of projects) {
    if (p.isDirectory() && !p.name.startsWith('.')) {
      console.log(`[codebase-scan] Scanning project: ${p.name}`);
      await walk(path.join(PROJECTS_ROOT, p.name), p.name);
    }
  }

  // Infer links from imports
  console.log(`[codebase-scan] Inferring links for ${nodes.length} nodes...`);
  for (const node of nodes) {
    const fullPath = path.join(PROJECTS_ROOT, node.id);
    let content;
    try {
      content = await fs.readFile(fullPath, 'utf8');
    } catch {
      continue;
    }

    // Regex for imports (static and dynamic)
    const importRegex = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2];
      if (!importPath) continue;

      if (importPath.startsWith('.')) {
        // Local relative import
        const absoluteImportBase = path.resolve(path.dirname(fullPath), importPath);
        const possiblePaths = [
          absoluteImportBase,
          absoluteImportBase + node.ext,
          ...Array.from(EXTENSIONS).map(e => absoluteImportBase + e),
          path.join(absoluteImportBase, 'index' + node.ext),
          ...Array.from(EXTENSIONS).map(e => path.join(absoluteImportBase, 'index' + e))
        ];

        for (const p of possiblePaths) {
          const rel = absoluteToRelative.get(p);
          if (rel && rel !== node.id) {
            links.push({
              source: node.id,
              target: rel,
              type: 'import'
            });
            break;
          }
        }
      } else if (!importPath.includes(':') && !importPath.startsWith('@')) {
        // Could be a cross-project import if it's in the workspace but not a node_module
        // In this architecture, projects often refer to each other by name if linked or via relative paths
        // But let's check if the first part of the path matches a project name
        const parts = importPath.split('/');
        const firstPart = parts[0];
        // If we have a file with this ID (unlikely for bare imports unless configured)
        // Skip for now to avoid noise from node_modules
      }
    }
  }

  // Deduplicate links
  const seenLinks = new Set();
  const dedupedLinks = links.filter(l => {
    const key = `${l.source}->${l.target}`;
    if (seenLinks.has(key)) return false;
    seenLinks.add(key);
    return true;
  });

  const data = {
    generatedAt: new Date().toISOString(),
    nodes,
    links: dedupedLinks
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`[codebase-scan] Complete: ${nodes.length} nodes · ${dedupedLinks.length} links → ${OUTPUT_FILE}`);
}

scan().catch(console.error);
