# File-First vs MCP-First Boundary

**Document:** MCP-BOUNDARY.md  
**Project:** openclaw-nova-hub  
**Version:** 1.0  
**Created:** 2026-04-21  
**Purpose:** Explicitly define where file-first remains correct and where MCP should be introduced later.

---

## Core Principle

> **File-first is the default. MCP is for capabilities files cannot provide.**

This document prevents premature MCP adoption while identifying legitimate future MCP integration points.

---

## Decision Matrix

| Criterion | File-First | MCP-First |
|-----------|-----------|-----------|
| **Read-only, periodic data** | ✅ Preferred | ❌ Overkill |
| **Browser-safe public data** | ✅ Preferred | ❌ Overkill |
| **Cross-process sync (dashboard ↔ avatar)** | ✅ Preferred (file bridge) | Consider later |
| **Structured data with schema** | ✅ Preferred (JSON) | ❌ Overkill |
| **Real-time streaming (<1s latency)** | ❌ Insufficient | ✅ Required |
| **Bidirectional control (dashboard → system)** | ⚠️ Limited | ✅ Better fit |
| **Complex queries/filtering** | ⚠️ Client-side only | ✅ Server-side |
| **State mutation from browser** | ❌ Unsafe | ✅ Required (with auth) |
| **External API aggregation** | ⚠️ Bridge scripts | ✅ Native fit |

---

## Where File-First Remains Correct

### 1. Nova State (`public/nova-state.json`)

**Current:** `scripts/generate-nova-state.mjs` writes safe, synthesized state.

**Why file-first is correct:**
- State changes at human-relevant cadence (seconds to minutes)
- Must be browser-safe (no secrets, no raw messages)
- File generation is explicit, auditable, debuggable
- Dashboard polls via `useLiveNovaState` hook (sufficient for this cadence)

**Future MCP consideration:** Only if we need sub-second mood/focus updates from external sources.

### 2. Project Scan Data (`public/projects.json`)

**Current:** `scripts/scan.mjs` writes project metadata.

**Why file-first is correct:**
- Projects change at human timescales (minutes to hours)
- File generation is explicit, version-controllable
- Dashboard consumes static JSON (simple, fast, cacheable)
- Can be regenerated on demand (`npm run scan`)

**Future MCP consideration:** Only for real-time git monitoring or external project sources.

### 3. Continuity Status (`public/continuity-status.json`)

**Current:** `scripts/generate-continuity-status.mjs` writes synthesized continuity.

**Why file-first is correct:**
- Continuity state is derived from docs + runtime (not raw runtime)
- File synthesis is the explicit V1 approach per `CONTINUITY_LAYER_V1.md`
- Browser-safe by design (no raw conversation content)

**Future MCP consideration:** Phase 2/3 continuity may ingest from runtime APIs, but file remains the browser-safe output.

### 4. OpenClaw Status (`public/openclaw-status.json`)

**Current:** `scripts/openclaw-bridge.mjs` polls CLI and writes status.

**Why file-first is correct:**
- CLI commands are already the source of truth
- Bridge script transforms CLI output to browser-safe JSON
- File decouples CLI polling from dashboard rendering
- Retry/backoff logic lives in script, not dashboard

**Future MCP consideration:** Only if we replace CLI polling with a persistent service.

### 5. System Status (`public/system-status.json`)

**Current:** `scripts/system-bridge.mjs` writes cron/memory status.

**Why file-first is correct:**
- System telemetry is periodic (minutes)
- File generation is auditable and debuggable
- Dashboard consumes safe, structured data

**Future MCP consideration:** Only for real-time system metrics (CPU/RAM graphs).

---

## Where MCP Makes Sense (Future)

### 1. File/System Telemetry MCP

**Use case:** Real-time CPU, RAM, disk, temperature metrics for Powers mode.

**Why MCP:**
- File-based polling is inefficient for high-frequency metrics
- Structured telemetry MCP provides cleaner schema
- Server-side aggregation reduces client complexity

**Trigger for adoption:** When Powers mode needs sub-5-second refresh on system metrics.

### 2. Browser Automation / Screenshot MCP

**Use case:** Reliable screenshot capture for visual iteration and review.

**Why MCP:**
- Current browser tool may have reliability issues
- MCP path could provide more stable automation
- Direct integration with review workflows

**Trigger for adoption:** When screenshot loop becomes critical path for iteration.

### 3. Git / Repo Insight MCP

**Use case:** Surface changed files, recent commits, branch status in Workspace mode.

**Why MCP:**
- File-based git polling is complex and fragile
- MCP can provide structured repo queries
- Better integration with GitHub/GitLab APIs

**Trigger for adoption:** When Workspace mode needs deep git integration.

### 4. Task/Session Observability MCP

**Use case:** Deep inspection of OpenClaw runtime tasks and sessions.

**Why MCP:**
- CLI output is text-based and fragile to parse
- MCP could provide structured task/session APIs
- Better querying (by project, by status, by duration)

**Trigger for adoption:** When Automations mode needs rich task drill-down.

---

## What We Explicitly Do NOT MCP (Yet)

### ❌ Nova State Generation

**Why not:** File-first is explicitly the safe path. MCP adds network complexity for no benefit at current cadence.

### ❌ Project Scanning

**Why not:** File scan is the canonical source. MCP would duplicate or fragment the scanning logic.

### ❌ Bridge Scripts

**Why not:** Bridge scripts transform CLI output to JSON. Replacing them with MCP requires the MCP to wrap the same CLI commands — no gain.

### ❌ Real-time Sync (Dashboard ↔ Avatar)

**Why not:** File-first bridge per `nova-avatar/ARCHITECTURE.md` is the explicit architecture. WebSocket/MCP is a future optimization, not a requirement.

---

## MCP Adoption Decision Tree

```
Does the capability require sub-second latency?
├── YES → Consider MCP (streaming/real-time)
└── NO → Continue
    Does the data need to be browser-safe/public?
    ├── YES → File-first (JSON in public/)
    └── NO → Continue
        Does the capability require state mutation from browser?
        ├── YES → MCP with auth (or file-based trigger)
        └── NO → Continue
            Is the data already available via CLI/file?
            ├── YES → File-first (bridge script)
            └── NO → Evaluate MCP for structured API access
```

---

## Current Bridge Architecture (File-First)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DASHBOARD (Browser)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  NovaCoreReactor │  │  CommandConsole  │  │  Sidebars    │  │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘  │
│           │                    │                   │          │
│           └────────────────────┼───────────────────┘          │
│                                ▼                                │
│                    ┌─────────────────────┐                      │
│                    │  useLiveNovaState   │                      │
│                    │  (polls JSON files) │                      │
│                    └──────────┬──────────┘                      │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                ▼ (file read)
┌─────────────────────────────────────────────────────────────────┐
│                     PUBLIC/ (Static JSON)                     │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │ nova-state   │ │ projects    │ │ openclaw-   │ │ system- │ │
│  │   .json      │ │   .json     │ │  status.json │ │ status  │ │
│  └──────────────┘ └─────────────┘ └──────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │ (write)
┌─────────────────────────────────────────────────────────────────┐
│                  BRIDGE SCRIPTS (Node.js)                     │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │ generate-nova-   │ │   scan.mjs    │ │ openclaw-bridge  │ │
│  │    state.mjs     │ │               │ │     .mjs         │ │
│  └────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘ │
│           │                  │                  │          │
│           └──────────────────┼──────────────────┘          │
│                              ▼                             │
│                   ┌─────────────────────┐                    │
│                   │   CLI / File Sys    │                    │
│                   │ (openclaw, git, fs) │                    │
│                   └─────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight:** The bridge scripts are the MCP-equivalent layer. They provide structured data to the dashboard without exposing raw CLI complexity or unsafe data.

---

## Future MCP Architecture (When Needed)

```
┌─────────────────────────────────────────────────────────────────┐
│                     DASHBOARD (Browser)                         │
│                              │                                  │
│                              ▼                                  │
│                    ┌─────────────────────┐                      │
│                    │   MCP Client Layer   │                      │
│                    │  (replaces polling) │                      │
│                    └──────────┬──────────┘                      │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                ▼ (MCP protocol)
┌─────────────────────────────────────────────────────────────────┐
│                     MCP SERVER LAYER                            │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌─────────┐ │
│  │   system-    │ │   git-      │ │  telemetry   │ │  task-  │ │
│  │ telemetry    │ │   insight   │ │   stream     │ │  obs    │ │
│  └──────────────┘ └─────────────┘ └──────────────┘ └─────────┘ │
│                              │                                 │
│                              ▼                                 │
│                   ┌─────────────────────┐                      │
│                   │   Native APIs       │                      │
│                   │ (OS, git, hardware) │                      │
│                   └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

**Migration path:**
1. Bridge scripts evolve to expose MCP server interfaces
2. Dashboard adds MCP client alongside file polling
3. Feature flags enable MCP for specific capabilities
4. File-first remains as fallback/debug path

---

## Immediate Recommendations

### Keep File-First

- ✅ Nova state generation (`scripts/generate-nova-state.mjs`)
- ✅ Project scanning (`scripts/scan.mjs`)
- ✅ OpenClaw bridge (`scripts/openclaw-bridge.mjs`)
- ✅ System bridge (`scripts/system-bridge.mjs`)
- ✅ Continuity generation (`scripts/generate-continuity-status.mjs`)

### Defer MCP

- ⏸️ System telemetry (until Powers mode needs real-time metrics)
- ⏸️ Git/repo insight (until Workspace mode needs deep git)
- ⏸️ Task observability (until Automations mode needs rich drill-down)
- ⏸️ Screenshot automation (until visual iteration loop is critical)

### Prepare For MCP (Low-Cost)

- Document bridge script schemas (they become MCP tool schemas)
- Keep bridge scripts modular (easy to wrap as MCP tools)
- Monitor dashboard polling frequency (triggers MCP consideration)

---

## Security Notes

**File-first is inherently browser-safe:**
- Files in `public/` are explicitly public
- Bridge scripts filter secrets before writing
- No direct filesystem access from browser

**MCP requires explicit security:**
- MCP servers must auth/validate requests
- No raw message content exposed via MCP
- Browser-side MCP client needs origin validation

---

## Success Criteria for MCP Adoption

MCP should only be adopted when:
1. File-first cannot meet latency requirements (<5s refresh)
2. Data is not browser-safe and needs server-side filtering
3. Complex querying/filtering is required
4. Bidirectional control from browser is needed
5. External API integration is required

**Current status:** None of these criteria are met. File-first remains correct.

---

**Related documents:**
- `MODE-ARCHITECTURE.md` — Mode definitions and UI architecture
- `NOVA_SYSTEM_PLAN.md` — System vision and principles
- `NEXT-ARCHITECTURE-PLAN.md` — Immediate priorities
- `CONTINUITY_LAYER_V1.md` — State management approach
- `nova-avatar/ARCHITECTURE.md` — Avatar bridge design (file-first)
