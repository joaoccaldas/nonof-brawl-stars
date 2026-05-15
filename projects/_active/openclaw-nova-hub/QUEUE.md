# QUEUE — OpenClaw Nova Hub

**Purpose:** Canonical next-step queue for the Nova command center project.
**Rule:** Heartbeats and cron-driven work should read this file before deciding what to advance.
**Last updated:** 2026-04-21 22:30 Europe/Stockholm

---

## Current mission

Transform `openclaw-nova-hub` from a project index into Nova's living command center, while keeping `nova-avatar` as the embodiment layer.

Do not create duplicate dashboard systems or parallel Nova projects.

---

## Guardrails

- Reuse existing structure before creating anything new
- Keep dashboard logic in `openclaw-nova-hub`
- Keep 3D/avatar logic in `nova-avatar`
- Prefer file-based state sync before adding network complexity
- Avoid unsafe dynamic execution or browser-exposed filesystem access
- No secrets in frontend bundles or public JSON
- Validate every UI change with a production build
- Document each meaningful step in this file or project plan

---

## Current status

### Completed
- Added `NOVA_SYSTEM_PLAN.md`
- Added initial `public/nova-state.json`
- Added `NovaCorePanel.jsx`
- Wired dashboard to load Nova state
- Updated pulse view to expose Nova status/open loops
- Extended scanner with project operational metadata (`modifiedToday`, queue/state detection, safety notes)
- Added `ActiveMissionsPanel.jsx`
- Added `AvatarBridgePanel.jsx`
- Added canonical `QUEUE.md` for autonomous continuation
- **Built `NovaCoreReactor.jsx`** — true Jarvis-style centerpiece with:
  - Pulsing core orb with mood-based colors
  - Rotating telemetry rings with orbital markers
  - Animated waveform canvas showing "neural activity"
  - Asymmetric tactical layout (Nova identity | reactor | systems/activity)
  - Live state visualization with confidence, focus, mood
  - System status panel with activity indicators
  - Bottom telemetry bar with thread/observations/open loops
- **Built `CommandConsole.jsx`** — bottom-drawer CLI with:
  - Terminal aesthetic (dark, monospace, colored output)
  - Commands: scan, status, open, queue, help, clear
  - Command history with up/down navigation
  - Autocomplete suggestions
  - Hotkey: Cmd+Shift+K to toggle
- **Built `MissionControlSidebar.jsx`** — left sidebar with:
  - Active missions with progress bars
  - "Modified today" projects highlighted
  - Queue peek showing next 3 actions
  - Quick-launch buttons for dashboards/worlds
  - Collapsible sections
  - Hotkey: Cmd+1 to toggle
- **Built `SystemsTelemetrySidebar.jsx`** — right sidebar with:
  - Live neural pulse visualization (animated bars)
  - System health indicators (Dashboard, Memory, Avatar, WhatsApp, Cron)
  - Cron job schedule and last-run status
  - Memory index statistics
  - Hotkey: Cmd+2 to toggle
- **Updated `App.jsx`** to integrate all components with hotkey bindings
- **Built visual effects suite** — final JARVIS polish:
  - `ScanLines.jsx` — subtle CRT scan lines with glitch effects
  - `HUDBrackets.jsx` — animated corner brackets with targeting reticle
  - `TechLoader.jsx` — hexagonal spinner with typewriter text
  - `HolographicDepth.jsx` — mouse-following glow and parallax grid
- **Integrated all effects** in App.jsx with performance optimization
- **Replaced generic spinner** with TechLoader throughout
- Validated `npm run scan && npm run build`

### In progress
- Replace static `public/nova-state.json` with generated safe state
- Improve security audit coverage for browser-safe data exposure
- Mirror safe Nova state into `nova-avatar/state/nova_state.json` for the file-based embodiment bridge
- Deepen Home/Command screen so it becomes calmer and more actionable than Explorer mode
- Make Home continuity feel native to command mode instead of a separate debug panel
- Push Home toward a sparser premium command surface with a stronger mission spine and lower chrome density
- Minimize the global header and let Nova presence dominate the Home screen

---

## Next tasks

### 1. Nova core reactor centerpiece
**Status:** ✅ COMPLETED — built `NovaCoreReactor.jsx` with pulsing orb, rotating rings, waveform canvas, asymmetric tactical layout

---

### 2. Interactive architecture explorer
**Status:** READY
**Goal:** Let João inspect the real architecture from the dashboard.

Detailed work:
- show relationships between major systems
- make key architecture nodes interactive
- add file/drilldown affordances for core project files
- surface queues, states, dashboards, and embodiment links

Validation:
- open paths safely
- no browser write surfaces
- no sensitive file exposure

---

### 3. Sub-dashboard and file interaction layer
**Status:** READY
**Goal:** Improve interactivity across sub-dashboards and core project assets.

Detailed work:
- strengthen launch flows for dashboards/worlds
- add context-aware actions per project
- surface architecture-aware next actions
- improve command-surface feel

Validation:
- route correctness
- no unsafe shell execution from browser
- explicit user-triggered launch only

---

### 4. Secure state generation
**Status:** IN PROGRESS
**Goal:** Replace the hand-authored `public/nova-state.json` with a generated safe state payload.

Implemented:
- `scripts/generate-nova-state.mjs`
- npm script: `npm run nova-state`
- state derived from safe scan + queue metadata only

Next:
- integrate into watch/update cycle more tightly
- expand safe telemetry coverage
- keep mirrored avatar state aligned to the same safe contract

Requirements:
- no secrets
- no raw personal message contents
- no system paths beyond what the dashboard already uses
- safe for browser exposure

**Why:** Public dashboard data must stay intentionally minimal and non-sensitive.

---

### 5. Avatar contract alignment
**Status:** IN PROGRESS
**Goal:** Align `nova-avatar` scripts to the shared safe Nova state model.

Detailed work:
- audit bridge-related scripts
- define safe state consumption path
- map state to avatar reactions
- fail safely on missing/corrupt state

Progress:
- audited `nova_brain.gd`, `state_manager.gd`, `world_controller.gd`, `second_brain_bridge.gd`, and avatar scripts
- added file-based mirror of generated Nova state into `nova-avatar/state/nova_state.json`
- added `scripts/nova_state_bridge.gd` on avatar side and wired it through `WorldController`
- confirmed bridge startup during headless Godot initialization

Remaining:
- refine state-to-animation mapping
- decide whether avatar-side chat brain should react to bridge state beyond animation/mood
- keep unrelated voxel/building script parse errors tracked separately as non-bridge blockers

---

### 6. Documentation alignment
**Status:** ACTIVE
**Goal:** Keep these files aligned as work progresses:
- `openclaw-nova-hub/NOVA_SYSTEM_PLAN.md`
- `openclaw-nova-hub/QUEUE.md`
- `openclaw-nova-hub/CONTINUITY_LAYER_V1.md`
- `openclaw-nova-hub/docs/MODE-ARCHITECTURE.md` ✅ Added
- `openclaw-nova-hub/docs/MCP-BOUNDARY.md` ✅ Added
- `nova-avatar/QUEUE.md`
- `nova-avatar/ARCHITECTURE.md` (reference, not duplicate)

**Why:** Prevent architectural drift and duplicated instructions.

**Completed 2026-04-21:**
- ✅ Defined Nova Hub mode architecture (Command, Explorer, Workspace, Powers, Automations)
- ✅ Clarified file-first vs MCP-first boundary with decision matrix and adoption criteria

---

### 7. Continuity layer v1
**Status:** IN PROGRESS
**Goal:** Make Nova's action, waiting, completion, and drift state visible in the hub.

Implemented:
- `scripts/generate-continuity-status.mjs`
- `public/continuity-status.json`
- `src/components/ContinuityPanel.jsx`
- continuity panel wired into `App.jsx`
- V1 design doc: `CONTINUITY_LAYER_V1.md`

Next:
- enrich continuity data beyond docs-only synthesis
- add waiting-on and drift signals
- connect continuity state to runtime/task outcomes
- later extract this into a reusable `continuity-debugging` skill

---

### 8. Overnight execution queue
**Status:** ACTIVE
**Goal:** Run a disciplined night improvement cycle without horizontal sprawl.

Implemented:
- created `NIGHT-QUEUE-2026-04-21.md`
- promoted explicit Home vs Explorer split in the UI
- reduced Explorer/List card metadata noise so cards scan faster
- tightened Home command focus with clearer doing-now / waiting-on / next-move summaries
- added a native continuity-in-command section with high-signal action state

Focus waves tonight:
1. command home hierarchy
2. graph demotion to explorer role
3. Nova center identity refinement
4. continuity/runtime truth improvement
5. architecture clarity docs
6. explicit Home vs Explorer separation with calmer command surface

---

## Heartbeat / cron execution policy

When autonomous work touches this project, prefer this order:
1. Read `QUEUE.md`
2. Read `NOVA_SYSTEM_PLAN.md` if architectural choice is involved
3. Make one contained improvement
4. Validate (`npm run build` or equivalent)
5. Update queue/docs with what changed and next recommended step

If blocked, record the blocker explicitly here instead of silently stopping.

---

## Security checklist for each change

- [ ] No secrets added to `public/` or frontend source
- [ ] No unsafe HTML injection or `dangerouslySetInnerHTML`
- [ ] No untrusted shell execution exposed through UI
- [ ] No filesystem write path exposed to browser clients
- [ ] Build validated after UI changes
- [ ] New docs placed in existing project folder only

---

## Known future direction

After the dashboard core is stable:
- finish automatic Nova state generation and integrate it into watch/update flows
- link avatar and dashboard through one shared state model
- audit `nova-avatar` bridge scripts and align them to the safe contract
- add more Jarvis-like visual hierarchy and command feel
- optionally add a safe local bridge service for live sync
