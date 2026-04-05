# WORKSPACE_STRUCTURE.md — Single Source of Truth

**Last Updated:** 2026-04-03 by Supernova  
**Rule:** NO NEW FOLDERS WITHOUT UPDATING THIS FILE

---

## 📁 Folder Hierarchy

```
workspace/
│
├── memory/                    📓 RAW STREAMS (append-only, daily)
│   └── YYYY-MM-DD.md
│
├── knowledge/                 🧠 CURATED TRUTH (single source)
│   ├── ME.md                  👤 High-level durable truth about João
│   ├── MIELE.md               🏢 Everything about Miele
│   ├── CONCEPTS.md            🔗 Cross-domain patterns
│   ├── JOAO-TIMELINE.md       🕰️ Canonical life chronology
│   ├── JOAO-IDENTITY.md       🧬 Traits, drives, tensions, operating style
│   ├── JOAO-FAMILY.md         👨‍👩‍👧‍👦 Family map and lineage context
│   ├── JOAO-PLACES.md         📍 Place-based identity and geography
│   ├── JOAO-THEMES.md         🧵 Recurring life themes
│   ├── JOAO-BOOK-MAP.md       📚 Future memoir / narrative scaffolding
│   ├── JOAO-FAMILY-EMAIL-ANALYSIS-2016-2026.md  ✉️ Family context from Gmail synthesis
│   └── graph/
│       └── people/            👤 Optional graph-ready person nodes
│
├── inbox/                     📥 UNPROCESSED INPUTS (temporary)
│   ├── youtube/               🎬 YouTube transcripts
│   ├── meetings/              🤝 Meeting transcripts
│   ├── notes/                 📝 Quick thoughts
│   └── images/                📸 Image inbox (processed by image-ingestion skill)
│       ├── miele/
│       ├── automation/
│       ├── ai/
│       ├── private/
│       │   └── secure/        🔐 SACRED — body photos, family (MOST PRIVATE)
│       ├── tech-owned/        🔧 João's tech inventory (devices, wearables, telescopes)
│       │   ├── telescopes/
│       │   ├── wearables/
│       │   └── general/
│       └── other/
│
├── projects/                  🚧 ACTIVE WORK (current only)
│   └── [project-name]/
│       └── README.md
│
├── archive/                   🗄️ COMPLETED (moved here, never deleted)
│   └── YYYY-MM/
│       └── [project-name]/
│
├── templates/                 📋 REUSABLE BLUEPRINTS
│   ├── project-README.md
│   ├── prototype-SPEC.md
│   ├── meeting-NOTES.md
│   ├── youtube-ANALYSIS.md
│   └── README.md
│
├── skills/                    🧩 WORKFLOW SKILLS (agent behavior guides)
│   ├── audio-ingestion/
│   │   └── SKILL.md
│   ├── youtube-ingestion/
│   │   └── SKILL.md
│   ├── image-ingestion/
│   │   └── SKILL.md
│   └── meeting-transcript-ingestion/
│       └── SKILL.md
│
├── TOOLS.md                   🔧 API keys, SSH, preferences
├── AGENTS.md                  🤖 My instructions
└── WORKSPACE_STRUCTURE.md     📋 THIS FILE — folder bible
```

---

## 🚫 Folder Creation Rules

### **Before Creating ANY Folder:**

1. **Read this file** — check if folder already exists under different name
2. **Check semantic fit** — does it belong in existing structure?
3. **Document it here** — update this file BEFORE creation
4. **Get confirmation** — if unsure, ask

### **Forbidden Patterns:**
- ❌ `knowledge/miele/` (use MIELE.md sections instead)
- ❌ `memory/projects/` (memory is daily, not topical)
- ❌ `inbox/processed/` (processed = move to knowledge/, not subfolder)
- ❌ Date folders anywhere except memory/

### **Allowed Patterns:**
- ✅ `projects/[new-active-project]/` — for active work
- ✅ `archive/YYYY-MM/[project]/` — when project completes
- ✅ New file in existing folder (preferred over new folder)

---

## 📋 Folder Purposes (In Detail)

### `memory/` — Daily Log
**Purpose:** Chronological record of everything  
**Naming:** `YYYY-MM-DD.md`  
**Retention:** Permanent, never delete  
**Content:** What happened, decisions made, links to processed items

**People detection rule:**
- New names, candidate contacts, alias sightings, ambiguous relationships, and repeated mentions should be logged here first before promotion to `knowledge/ME.md`.

### `knowledge/` — Living Documents
**Purpose:** Current state of understanding  
**Files:** Core knowledge files plus João-specific biography/identity files  
**Updates:** Continuous, append or edit in place  
**Rule:**
- `ME.md` = distilled high-level durable truth about João
- `MIELE.md` = Miele/business knowledge
- `CONCEPTS.md` = cross-domain patterns
- `JOAO-*.md` files = structured biographical, thematic, family, place, and book-oriented knowledge about João
- `knowledge/graph/people/` = optional graph-ready person entities when a person needs a first-class reusable node

**Canonical people/relationship rule:**
- High-level durable people/relationship truth belongs in `knowledge/ME.md`.
- Structured family history, lineage context, and household mapping belong in `knowledge/JOAO-FAMILY.md`.
- Structured life chronology belongs in `knowledge/JOAO-TIMELINE.md`.
- Place-linked identity context belongs in `knowledge/JOAO-PLACES.md`.
- Recurring life motifs belong in `knowledge/JOAO-THEMES.md`.
- Possible future narrative/book scaffolding belongs in `knowledge/JOAO-BOOK-MAP.md`.
- Gmail/email-derived family synthesis belongs in dedicated analysis files like `knowledge/JOAO-FAMILY-EMAIL-ANALYSIS-*.md`.
- When needed, first-class person records can live in `knowledge/graph/people/` with stable IDs for future graph migration.
- Do **not** create a top-level `contacts/` folder unless scale clearly outgrows this structure and the architecture is updated here first.
- One-off or ambiguous person mentions go to `memory/YYYY-MM-DD.md` first, not directly into canonical knowledge.

### `inbox/` — Staging Area
**Purpose:** Temporary holding for unprocessed inputs  
**Lifecycle:** 
1. File arrives here
2. Sub-agent processes
3. Knowledge extracted to `knowledge/`
4. Log entry added to `memory/`
5. **Original file deleted** (or moved to archive/ if valuable raw)

**People extraction rule:**
- Raw mentions of people from transcripts, notes, emails, or calendar-derived artifacts stay in `inbox/` during processing.
- Only durable, validated person knowledge is promoted to `knowledge/ME.md`.

**Max Age:** 7 days (cron job warns if older)

### `projects/` — Active Work
**Purpose:** Current initiatives with multiple files  
**Each Project Contains:**
- `README.md` — canonical source of truth for that project
- Other files as needed
- `TODO.md` (optional)

**Project governance rule:**
- `projects/README.md` is the control-tower index of active and near-active projects.
- Every active project should have one canonical `README.md` with status, current focus, next step, and recent updates.
- Raw ideas should not become projects immediately; they should be captured first, then promoted when they require ongoing tracking.
- Project schemas should remain simple markdown now, but include enough metadata for future tracking and visualization.

**Move to `archive/` when:**
- Completed
- Paused > 3 months
- Superseded

### `archive/` — Cold Storage
**Purpose:** Preserve without cluttering active workspace  
**Structure:** `archive/YYYY-MM/[project-or-file]/`  
**Access:** Searchable but not loaded at startup  
**Rule:** Never delete, only archive

### `templates/` — Reusable Blueprints
**Purpose:** Standardized starter files for recurring work  
**Examples:** project readmes, meeting notes, transcript analysis templates  
**Rule:** Edit copies, not originals

### `skills/` — Workflow Skills
**Purpose:** Reusable workflow knowledge that tells the agent when/how to use tools for repeated task types  
**Examples:** audio ingestion, YouTube ingestion, image ingestion, meeting transcript ingestion  
**Rule:** Keep environment-specific machine/tool defaults in `TOOLS.md`; keep reusable workflow logic in `skills/*/SKILL.md`

**Skill governance:**
- Before creating a new skill, first check bundled OpenClaw skills, workspace skills, shared skill folders, and existing workflow/docs coverage.
- Prefer improving an existing skill over creating duplicates.
- Skills should stay concise and operational; add `references/` or `scripts/` later only when needed.
- Repeated ingestion skills should be designed for normalization, deduplication, and future graph-friendly metadata extraction.

---

## 🔍 Validation Checklist

Every time I write a file, I check:

- [ ] Does this path exist in WORKSPACE_STRUCTURE.md?
- [ ] Is this the right folder for this content type?
- [ ] Will this create a duplicate or conflict?
- [ ] Should this be a new file or append to existing?
- [ ] Is `inbox/` being used as temporary staging?

---

## 📝 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-04-03 | Initial structure | Supernova |
| 2026-04-03 | Added templates folder to match workspace tree | Copilot |
| 2026-04-04 | Clarified canonical people/relationship storage and promotion rules across knowledge/memory/inbox | Supernova |
| 2026-04-04 | Added project control-tower and project-schema governance rules for future tracking/visualization | Supernova |
| 2026-04-04 | Added `skills/` as canonical workspace location for custom workflow skills and documented skill governance | Supernova |
| 2026-04-05 | Added João-specific biography/identity knowledge files and book-scaffolding structure under `knowledge/` | Supernova |
| 2026-04-05 | Added family email synthesis file and optional graph-ready person-node structure under `knowledge/graph/people/` | Supernova |

---

## ❓ FAQ

**Q: What if I need a folder for [X]?**  
A: Check if X fits in existing structure. If not, propose addition here first.

**Q: Can I create temporary folders?**  
A: No. Use `inbox/` with clear naming, then process and delete.

**Q: What about backups?**  
A: Git commit weekly. `archive/` is for completed work, not backup.

**Q: Search is slow with many files?**  
A: We have `memory_search` tool. If still slow, we'll add indexing, not more folders.
