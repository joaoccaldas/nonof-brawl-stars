#!/usr/bin/env node
/**
 * scan-contacts.mjs — Extract people/contacts from memory files
 * STRICT: Only known people, no auto-discovery noise
 */

import fs from 'fs/promises';
import path from 'path';

const WORKSPACE_DIR = path.join(process.env.HOME || '/Users/joao', '.openclaw', 'workspace');
const MEMORY_DIR = path.join(WORKSPACE_DIR, 'memory');
const KNOWLEDGE_DIR = path.join(WORKSPACE_DIR, 'knowledge');

const OUTPUT_FILE = path.join(process.cwd(), 'public', 'contacts.json');

// CURATED CONTACTS — only people we explicitly know about
// No auto-discovery. If someone should be here, add them.
const KNOWN_PEOPLE = [
  // Family
  { name: 'João Caldas', role: 'self', priority: 'high', tags: ['family', 'core', 'self'], aliases: ['João', 'JC'] },
  { name: 'Linn Caldas', role: 'wife', priority: 'high', tags: ['family', 'spouse'], aliases: ['Linn'] },
  { name: 'Lukas Caldas', role: 'son', priority: 'high', tags: ['family', 'child', 'P14', 'handball'], aliases: ['Lukas'], birthdate: '2014-11-07' },
  { name: 'Noah Caldas', role: 'son', priority: 'high', tags: ['family', 'child', 'P17', 'handball', 'gaming'], aliases: ['Noah'], birthdate: '2017-02-14' },
  // Family (Brazilian)
  { name: 'Paulo Caldas', role: 'father', priority: 'high', tags: ['family', 'brazil', 'salvador', 'pernambues', 'coordinator'], aliases: ['Paulo'], notes: 'Family escalator/coordinator, Juliana-process central figure, work email family communicator' },
  { name: 'Margarida de Oliveira Caldas', role: 'mother', priority: 'high', tags: ['family', 'brazil', 'salvador', 'pernambues', 'organizer'], aliases: ['Margarida'], notes: 'Family glue/warmth source, logistics coordinator, saudade expresser' },
  { name: 'Juliana Caldas', role: 'sister', priority: 'high', tags: ['family', 'brazil', 'salvador', 'pernambues', 'sister'], aliases: ['Juliana'], notes: 'Central figure in major 2016-2019 family mobilization (medical/legal), cross-border support recipient' },
  { name: 'Cecilia Lima Caldas', role: 'sister', priority: 'medium', tags: ['family', 'brazil', 'saopaulo', 'sister'], aliases: ['Cecilia'], notes: 'Sister, moved Salvador→Recife→São Paulo, more geographically distant, less central in email sample' },
  
  // Friends
  { name: 'Jonatha', role: 'best friend', priority: 'high', tags: ['friend', 'lifelong', 'music', 'surfing', 'brazil', 'salvador'], aliases: ['Jonatha'], birthdate: null, notes: 'Known since ~1997-98, 6-7 years younger, award-winning car-pushing story, camping/surfing buddy' },
  { name: 'Thais', role: 'friend (Jonatha wife)', priority: 'medium', tags: ['friend', 'brazil', 'salvador'], aliases: ['Thais'], notes: 'Jonatha\'s wife, part of Pernambués friend circle' },
  { name: 'Mareza', role: 'friend (Jonatha sister)', priority: 'medium', tags: ['friend', 'brazil', 'salvador'], aliases: ['Mareza', 'Maressa'], notes: 'Jonatha\'s sister, same age as João, past romantic connection, central figure in car-pushing story' },
  
  // Work
  { name: 'Niklas Mair', role: 'managing director', priority: 'high', tags: ['work', 'miele', 'md', 'nordics'], aliases: ['Niklas', 'Nicholas'] },
  { name: 'Kasper', role: 'direct report', priority: 'medium', tags: ['work', 'miele', 'team'], aliases: ['Kasper'] },
  { name: 'Jenni', role: 'colleague', priority: 'low', tags: ['work', 'miele'], aliases: ['Jenni'] },
  // Additional Miele contacts from knowledge files
  { name: 'Grete Kobbevik', role: 'colleague', priority: 'medium', tags: ['work', 'miele'], aliases: ['Grete'] },
  { name: 'Maria Karvouni', role: 'colleague', priority: 'medium', tags: ['work', 'miele'], aliases: ['Maria'] }
];

// Extract context around mentions
function extractContext(text, name, window = 150) {
  // Try name variations
  const names = [name, ...KNOWN_PEOPLE.find(p => p.name === name)?.aliases || []];
  
  for (const n of names) {
    const index = text.toLowerCase().indexOf(n.toLowerCase());
    if (index !== -1) {
      const start = Math.max(0, index - window);
      const end = Math.min(text.length, index + n.length + window);
      return text.slice(start, end).replace(/\n/g, ' ').trim();
    }
  }
  return null;
}

async function scanFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const stat = await fs.stat(filePath);
    const fileName = path.basename(filePath);
    
    const mentions = [];
    
    // Check for each known person
    KNOWN_PEOPLE.forEach(person => {
      // Check all aliases
      const namesToCheck = [person.name, ...person.aliases];
      let totalMentions = 0;
      
      namesToCheck.forEach(name => {
        const pattern = new RegExp(`\\b${name}\\b`, 'gi');
        const matches = content.match(pattern) || [];
        totalMentions += matches.length;
      });
      
      if (totalMentions > 0) {
        const context = extractContext(content, person.name);
        mentions.push({
          person: person.name,
          role: person.role,
          tags: person.tags,
          priority: person.priority,
          birthdate: person.birthdate,
          mentionCount: totalMentions,
          file: fileName,
          filePath,
          date: stat.mtime.toISOString(),
          context
        });
      }
    });
    
    return mentions;
  } catch (e) {
    return [];
  }
}

async function scanDirectory(dir) {
  const results = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const fileResults = await scanFile(path.join(dir, entry.name));
        results.push(...fileResults);
      }
    }
  } catch (e) {
    // Directory doesn't exist
  }
  
  return results;
}

async function generateContacts() {
  console.log('Scanning for contacts (strict mode)...');
  
  const memoryMentions = await scanDirectory(MEMORY_DIR);
  const knowledgeMentions = await scanDirectory(KNOWLEDGE_DIR);
  
  // Aggregate by person
  const byPerson = {};
  
  [...memoryMentions, ...knowledgeMentions].forEach(m => {
    if (!byPerson[m.person]) {
      byPerson[m.person] = {
        name: m.person,
        role: m.role,
        tags: m.tags,
        priority: m.priority,
        birthdate: m.birthdate,
        mentions: [],
        firstSeen: m.date,
        lastSeen: m.date,
        mentionCount: 0
      };
    }
    
    byPerson[m.person].mentions.push({
      file: m.file,
      date: m.date,
      context: m.context
    });
    
    byPerson[m.person].mentionCount += m.mentionCount;
    
    // Track first/last seen
    const date = new Date(m.date);
    if (date < new Date(byPerson[m.person].firstSeen)) {
      byPerson[m.person].firstSeen = m.date;
    }
    if (date > new Date(byPerson[m.person].lastSeen)) {
      byPerson[m.person].lastSeen = m.date;
    }
  });
  
  // Sort by priority then mention count
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const contacts = Object.values(byPerson)
    .sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.mentionCount - a.mentionCount;
    });
  
  // Add "not seen" known people (so they still appear in the list)
  const seenNames = new Set(contacts.map(c => c.name));
  KNOWN_PEOPLE.forEach(person => {
    if (!seenNames.has(person.name)) {
      contacts.push({
        name: person.name,
        role: person.role,
        tags: person.tags,
        priority: person.priority,
        birthdate: person.birthdate,
        mentions: [],
        firstSeen: null,
        lastSeen: null,
        mentionCount: 0
      });
    }
  });
  
  const output = {
    generated: new Date().toISOString(),
    stats: {
      totalContacts: contacts.length,
      highPriority: contacts.filter(c => c.priority === 'high').length,
      mediumPriority: contacts.filter(c => c.priority === 'medium').length,
      lowPriority: contacts.filter(c => c.priority === 'low').length,
      seenInLast30Days: contacts.filter(c => {
        if (!c.lastSeen) return false;
        const daysAgo = (new Date() - new Date(c.lastSeen)) / (1000 * 60 * 60 * 24);
        return daysAgo <= 30;
      }).length
    },
    contacts
  };
  
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log(`✓ Generated contacts database`);
  console.log(`  Total: ${output.stats.totalContacts}`);
  console.log(`  High priority: ${output.stats.highPriority}`);
  console.log(`  Medium priority: ${output.stats.mediumPriority}`);
  console.log(`  Low priority: ${output.stats.lowPriority}`);
  console.log(`  Seen recently: ${output.stats.seenInLast30Days}`);
  console.log(`\n✓ Written to ${OUTPUT_FILE}`);
}

generateContacts().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
