#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HUB_ROOT = path.resolve(__dirname, '..');
const PROJECTS_JSON = path.join(HUB_ROOT, 'public', 'projects.json');
const QUEUE_MD = path.join(HUB_ROOT, 'QUEUE.md');
const OUT_FILE = path.join(HUB_ROOT, 'public', 'nova-state.json');
const AVATAR_STATE_FILE = path.resolve(HUB_ROOT, '..', 'nova-avatar', 'state', 'nova_state.json');

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function readText(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return '';
  }
}

function extractOpenLoops(queueText) {
  const lines = queueText.split(/\r?\n/);
  const loops = [];
  let inNextTasks = false;
  for (const line of lines) {
    if (/^##\s+Next tasks/i.test(line)) {
      inNextTasks = true;
      continue;
    }
    if (inNextTasks && /^##\s+/.test(line)) break;
    if (inNextTasks && /^###\s+/.test(line)) {
      loops.push(line.replace(/^###\s+/, '').trim());
    }
  }
  return loops.slice(0, 5);
}

function chooseFocus(projects) {
  const modified = (projects || []).filter((p) => p.modifiedToday);
  if (modified.length === 0) return null;
  return modified.sort((a, b) => {
    const pa = a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2;
    const pb = b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2;
    if (pa !== pb) return pa - pb;
    return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
  })[0];
}

function inferAvatarStatus(projects) {
  const avatar = (projects || []).find((p) => p.slug === 'nova-avatar');
  if (!avatar) return 'offline';
  if (avatar.subDashboards?.some((d) => d.type === 'godot')) return 'prototype';
  return 'unknown';
}

async function main() {
  const data = await readJson(PROJECTS_JSON);
  const queue = await readText(QUEUE_MD);
  const focusProject = chooseFocus(data?.projects || []);
  const openLoops = extractOpenLoops(queue);

  const payload = {
    timestamp: new Date().toISOString(),
    nova: {
      state: focusProject ? 'building' : 'idle',
      mood: focusProject ? 'focused' : 'calm',
      focus: focusProject?.slug || 'openclaw-nova-hub',
      activeThread: focusProject?.nextStep || 'advance_nova_command_center',
      confidence: 0.86,
      lastObservation: focusProject
        ? `${focusProject.name} is active and was modified today.`
        : 'No modified-today project detected in the latest safe scan.',
      lastAction: 'Generated safe Nova state from queue and project scan metadata.',
      openLoops
    },
    systems: {
      dashboard: 'online',
      avatar: inferAvatarStatus(data?.projects || []),
      whatsapp: 'online',
      memory: 'online'
    }
  };

  await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2));
  await fs.mkdir(path.dirname(AVATAR_STATE_FILE), { recursive: true });
  await fs.writeFile(AVATAR_STATE_FILE, JSON.stringify(payload, null, 2));
  console.log(`[nova-state] wrote ${path.relative(HUB_ROOT, OUT_FILE)} and mirrored avatar state`);
}

main().catch((err) => {
  console.error('[nova-state] failed:', err);
  process.exit(1);
});
