# Nova Hub Mode Architecture

**Document:** MODE-ARCHITECTURE.md  
**Project:** openclaw-nova-hub  
**Version:** 1.0  
**Created:** 2026-04-21  
**Purpose:** Define the target mode structure for Nova Hub: Command, Explorer, Workspace, Powers, Automations.

---

## Overview

Nova Hub is evolving from a project dashboard into a living command center. This document defines the **mode architecture** — the primary operating modes that give the hub its Jarvis-like command surface feel while maintaining clarity of purpose.

The five modes are:

1. **Command** — Primary home. Nova-centric control surface for immediate action.
2. **Explorer** — Navigate relationships, architecture, and system topology.
3. **Workspace** — Deep work on specific projects with focused context.
4. **Powers** — Runtime controls, system status, and operational telemetry.
5. **Automations** — Cron, heartbeats, queues, and autonomous work streams.

---

## Mode 1: Command (Primary Home)

**Purpose:** The default and primary experience. Nova-centric command surface where João lands and acts.

**Visual hierarchy:**
- Nova Core Reactor is the emotional and functional center
- Left sidebar: Mission Control (active missions, queue, quick actions)
- Right sidebar: Systems Telemetry (live health, status indicators)
- Bottom: Command Console (terminal-style command interface)

**Content:**
- Nova state (mood, focus, confidence, active thread)
- Active missions panel (prioritized by `modifiedToday`, queue state)
- Quick command triggers (scan, status, open)
- Continuity panel (doing/waiting/completed visibility)

**Entry:** Default on load. Hotkey: `Cmd+Shift+H` (home).

**Current state:** ✅ Foundation exists (`NovaCoreReactor.jsx`, sidebars, command console)
**Gap:** Needs explicit mode switcher UI; currently always visible in stacked layout.

---

## Mode 2: Explorer

**Purpose:** Navigate the system topology — projects, relationships, architecture, and second brain connections. The **graph becomes an explorer tool**, not the home.

**Visual hierarchy:**
- Full-width Neural Graph as primary surface
- Floating overlay panels for node details
- Context-aware drill-down actions
- Architecture map overlay for high-level system view

**Content:**
- Interactive Neural Graph (projects as nodes, relationships as edges)
- Architecture explorer (system components and their connections)
- Second Brain connections (memory links, knowledge graph overlays)
- Project drill-down with safe file affordances (README, PROJECT_STATE, QUEUE)

**Entry:** Mode switcher, or hotkey `Cmd+E`.

**Current state:** ✅ `NeuralGraph.jsx` exists but dominates home
**Gap:** Needs explicit demotion from home-center to explorer-mode; needs architecture overlay.

---

## Mode 3: Workspace

**Purpose:** Deep work context for a specific project. Focused view with all project resources at hand.

**Visual hierarchy:**
- Project header with status, health, and quick actions
- Three-column layout:
  - Left: Project context (readme, state, recent changes)
  - Center: Working surface (placeholder for embedded tools, logs, outputs)
  - Right: Resources (links, dashboards, related projects)

**Content:**
- Project README rendered
- PROJECT_STATE.json summary
- Recent git activity (if applicable)
- Queue items for this project
- Related dashboards/worlds launcher
- Safe file affordances only (read-only from browser)

**Entry:** Click project in Command/Explorer mode → "Enter Workspace".

**Current state:** ⚠️ Project drawer exists but is a sidebar, not a workspace
**Gap:** Needs dedicated workspace layout; currently ProjectDrawer is too shallow.

---

## Mode 4: Powers

**Purpose:** Runtime controls and system telemetry. The operational dashboard for OpenClaw, models, crons, and task health.

**Visual hierarchy:**
- Grid of system cards (Gateway, Models, Sessions, Cron, Tasks, Memory)
- Live telemetry visualization (neural pulse bars, activity graphs)
- Alert/notification surface for issues requiring attention
- Action panel for manual interventions (refresh, restart, audit)

**Content:**
- `openclaw-status.json` visualization (gateway, models, sessions)
- `system-status.json` visualization (cron, memory index)
- `continuity-status.json` visualization (doing/waiting/blocked)
- Live refresh controls
- Alert log and acknowledgment surface

**Entry:** Mode switcher, or hotkey `Cmd+P`.

**Current state:** ✅ `SystemsTelemetrySidebar` exists, but limited
**Gap:** Needs full-page layout; currently sidebar-only view.

---

## Mode 5: Automations

**Purpose:** Visibility into autonomous and scheduled work. Queue status, cron schedules, heartbeat outcomes, and automation health.

**Visual hierarchy:**
- Timeline/stream view of recent automation events
- Queue panels (active, pending, completed, blocked)
- Cron schedule visualization (what runs when, last run status)
- Heartbeat outcome log with success/failure indicators

**Content:**
- `QUEUE.md` and `NIGHT-QUEUE-*` rendering
- Cron job list with last-run status
- Recent heartbeat summaries
- Automation event stream (with filtering by project/type)
- Blocked item highlighting with explicit blocker text

**Entry:** Mode switcher, or hotkey `Cmd+A`.

**Current state:** ⚠️ Fragmented across components; no unified view
**Gap:** Needs dedicated component; currently only glimpsed in sidebars.

---

## Mode Switcher UI

**Placement:** Fixed position, likely top-right or integrated into header.

**Design:**
- 5-mode tab bar or radial menu
- Current mode highlighted
- Unread/attention badges on modes needing attention
- Keyboard shortcuts accessible via `?` help overlay

**Transitions:**
- Smooth mode transitions with animation
- Preserve context (e.g., selected project) across compatible mode switches
- Remember last mode per session

---

## Implementation Strategy

### Phase 1: Mode Shell (Immediate)
- Create `ModeSwitcher` component
- Define mode state in `App.jsx`
- Wrap existing content in mode-aware conditional rendering
- Command mode becomes explicit, not implicit default

### Phase 2: Mode Hardening
- Refine Command mode as primary (current reactor + sidebars)
- Promote Explorer mode with dedicated full-width graph view
- Extend ProjectDrawer into basic Workspace mode

### Phase 3: Powers & Automations
- Build full-page `PowersMode` component
- Build full-page `AutomationsMode` component
- Integrate live refresh and event streaming

### Phase 4: Workspace Deepening
- Enhance Workspace mode with embedded file viewing
- Add dashboard/world launcher integration
- Add workspace-specific persistence (last open files, scroll position)

---

## Current File Mapping

| Mode | Existing Files | New Files Needed |
|------|---------------|------------------|
| Command | `NovaCoreReactor.jsx`, `MissionControlSidebar.jsx`, `SystemsTelemetrySidebar.jsx`, `CommandConsole.jsx`, `ActiveMissionsPanel.jsx`, `ContinuityPanel.jsx` | `ModeSwitcher.jsx` (enhance) |
| Explorer | `NeuralGraph.jsx`, `DashboardExplorer.jsx` | `ArchitectureOverlay.jsx`, `NodeDetailPanel.jsx` |
| Workspace | `ProjectDrawer.jsx` (shallow) | `WorkspaceMode.jsx`, `ProjectContextPanel.jsx`, `ResourcePanel.jsx` |
| Powers | `SystemsTelemetrySidebar.jsx` (partial), `SystemStatus.jsx` | `PowersMode.jsx`, `SystemCard.jsx`, `TelemetryGrid.jsx` |
| Automations | `ContinuityPanel.jsx` (partial) | `AutomationsMode.jsx`, `QueuePanel.jsx`, `CronSchedule.jsx`, `EventStream.jsx` |

---

## Open Questions

1. **Mode persistence:** Should last mode be saved to localStorage?
2. **Deep linking:** Should modes be URL-addressable (e.g., `/explorer`, `/powers`)?
3. **Workspace multi-instance:** Should multiple workspace tabs be supported?
4. **Mobile adaptation:** How do sidebars adapt in Command mode on narrow screens?

---

## Success Criteria

- Each mode has a clear, non-overlapping purpose
- Mode switching is fast (<200ms perceived)
- Command mode feels like a true Jarvis home
- Explorer mode makes the graph feel like a navigation tool, not a decoration
- Powers mode surfaces real system truth (not placeholders)
- Automations mode makes queue/cron state visible and actionable
- Workspace mode enables focused project work without leaving the hub

---

**Related documents:**
- `NOVA_SYSTEM_PLAN.md` — Vision and system architecture
- `NEXT-ARCHITECTURE-PLAN.md` — Immediate priorities and skills
- `CONTINUITY_LAYER_V1.md` — State management for mode-aware continuity
- `MCP-BOUNDARY.md` — File-first vs MCP-first decisions (see separate doc)
