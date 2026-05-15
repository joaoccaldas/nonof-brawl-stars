# Night Queue — 2026-04-21

## Purpose

Overnight execution queue for Nova Hub command-center improvement. This queue is intentionally staged, validated, and documented to avoid overnight slop.

## Execution rules

- One orchestrated queue, not free-for-all parallel work
- Every completed task must update docs/queue state
- Every code-changing task must run a build
- If blocked, write the blocker explicitly
- Prefer contained improvements over broad refactors

## Overnight waves

### Wave 1 — Trust and command hierarchy

#### Task N1 — Make screen 2 the canonical command home ✅ COMPLETED
**Owner:** Codex / coding agent
**Goal:** Rebalance home view so Nova-centered command mode is clearly primary and graph mode becomes secondary/explorer-oriented.
**Scope:** `src/App.jsx`, `src/components/NovaCoreReactor.jsx`, related home-mode layout files
**Validate:** `npm run build`
**Done when:** command home reads clearly as primary experience
**Completed:** 2026-04-21 22:20
**Changes:**
- App.jsx: Restructured layout with clear "Command Home" section at top
  - Added Command Console button as primary action (⌘⇧K) with cyan emphasis styling
  - Reordered command surface triggers: Console, Quick Launch, Mission Control, Systems
  - Moved NeuralGraph and CardGrid into new "Project Explorer" section with visual separation
  - Added explicit "Secondary Mode" label to graph area
- NovaCoreReactor.jsx: Updated identity
  - Changed title from "System Online" to "Command Center"
  - Added "Primary" label to Nova Core badge
**Validation:** Build successful ✅

#### Task N2 — Demote graph mode into explicit explorer role ✅ COMPLETED
**Owner:** Codex / coding agent
**Goal:** Move project graph toward an explorer/secondary mode rather than the emotional center of the UI.
**Scope:** `src/components/NeuralGraph.jsx`, mode/navigation wiring if needed
**Validate:** `npm run build`
**Done when:** graph is still present but no longer dominates the home command story
**Completed:** 2026-04-21 23:50
**Changes:**
- `NeuralGraph.jsx`: Demoted from dominant visual to contained explorer tool
  - Reduced height from 560px to 320px (compact explorer view)
  - Changed border from `rounded-3xl` to `rounded-xl` with subtle `border-white/5`
  - Replaced prominent "Neural Map" header with compact "Graph Explorer" label
  - Added hand/pointer icon for discoverability
  - Simplified legend to show only first 4 domains with "+N more" indicator
  - Reduced grid veil opacity from 50% to 30%
  - Changed loading text from "Loading neural map" to "Loading explorer map"
- `CardGrid.jsx`: Repositioned as "List View" alternative
  - Added list icon and "List View" label matching Graph View pattern
  - Reduced header prominence (removed large "Projects" heading)
- `App.jsx`: Restructured Explorer section as secondary mode
  - Added Explorer Mode badge with border styling
  - Reorganized layout: Graph View in bordered container above List View
  - Added explicit "Visual exploration" hint text
  - Changed right column width from 320px to 380px for better proportions
  - Added search icon to Explorer header for visual consistency
**Validation:** Build successful ✅

#### Task N3 — Refine Nova presence core ✅ COMPLETED
**Owner:** Codex / coding agent
**Goal:** Improve center identity and make Nova visually more iconic, feminine, cosmic, and unmistakable.
**Scope:** `src/components/NovaPresenceCore.jsx`, related styles
**Validate:** `npm run build`
**Done when:** center presence reads more like Nova than a generic AI reactor
**Completed:** 2026-04-21 23:58
**Changes:**
- `NovaPresenceCore.jsx`: Major visual refinement to make Nova unmistakably iconic
  - Enhanced cosmic nebula background with elliptical gradient for feminine softness
  - Added twinkling starfield particles (8 stars with staggered animations)
  - Refined orbital rings: slower, more elegant rotation (60s/35s cycles)
  - Added orbital dot markers along stellar paths for celestial navigation feel
  - Increased body size from 240×300 to 260×320 for more presence
  - Refined ellipsoid proportions: more graceful curves (50%/36% top radii)
  - Enhanced "eyes" with stronger glow and wider spans (44px→52px, 2px→3px)
  - Added iconic "third eye" intuition point between the eyes
  - Added graceful contour lines down the sides ("grace lines")
  - Added heart/core resonance ellipse in chest area
  - Enhanced crown glow with larger, softer radiance
  - Improved typography: lighter font weights, wider tracking for elegance
  - Changed label from generic "Nova Presence" to simply "Nova"
  - Refined all opacity values and gradients for softer, more feminine feel
  - Increased energy beam subtlety and flow
**Validation:** Build successful ✅

#### Task N8 — Explicit Home vs Explorer split ✅ COMPLETED
**Owner:** Nova direct implementation
**Goal:** Stop the project grid from behaving like the home screen and create a calmer, more actionable command home.
**Scope:** `src/App.jsx`, `src/components/ProjectCard.jsx`
**Validate:** `npm run build`
**Done when:** Home/Command feels sparse and intentional, Explorer feels like a browsing mode
**Completed:** 2026-04-22 05:10
**Changes:**
- `src/App.jsx`:
  - Added explicit mode toggle for `Home / Command` vs `Explorer`
  - Built a calmer Home/Command view with three snapshot cards: Doing now, Waiting on, Next move
  - Added priority surfaces rail showing only the top few projects worth attention first
  - Limited home mission focus to a smaller prioritized project set
  - Moved graph/list browsing fully behind Explorer mode instead of always sharing screen weight
  - Follow-up refinement: Home snapshots now use stronger continuity/project signals rather than generic placeholders
  - Follow-up refinement: added native `Continuity in Command` block with high-signal doing/waiting/completed state
  - Follow-up refinement: priority surfaces now prefer active/modified/high-priority/queued projects
- `src/components/ProjectCard.jsx`:
  - Reduced card noise by removing low-value file/path clutter from default view
  - Prioritized current focus / next step over raw file counts
  - Improved 1-second scan quality for explorer cards
- `src/components/ContinuityPanel.jsx`:
  - Reduced footer/debug note noise so the standalone continuity panel stays tighter
- `src/components/NovaCoreReactor.jsx`:
  - Added a stronger mission spine inside the main reactor surface
  - Reduced panel chrome and shifted command home toward a darker, sparser premium look
  - Tightened right-rail system cards so they feel more embedded in the command shell
  - Follow-up refinement: widened the reactor composition and shrank side rails so Nova presence dominates more of the screen
- `src/components/ActiveMissionsPanel.jsx`:
  - Added a compact `Mission spine` mode for Home so active work reads as a pickup lane instead of a generic grid
- `src/App.jsx`:
  - Upgraded Home panels to lower-chrome premium shells with calmer hierarchy
  - Follow-up refinement: removed most Home support panels so Home acts more like ambient command around the reactor
- `src/components/Header.jsx`:
  - Collapsed the large verbal hero header into a tiny utility bar with time and scan status only
- `src/components/NovaPresenceCore.jsx`:
  - Enlarged Nova’s visual field, orbital geometry, and body scale for a stronger iconic read
  - Reduced bottom label noise so the embodiment reads more like presence than UI copy
  - Follow-up polish: strengthened crown/halo geometry, eye readability, face veil, and core resonance so Nova reads more mythic and unmistakable from distance
- `src/components/NovaCoreReactor.jsx`:
  - Follow-up polish: reduced side-rail heaviness and shifted signal modules toward lighter floating instrumentation styling
**Validation:** Build successful ✅

### Wave 2 — Runtime truth and continuity

#### Task N4 — Upgrade continuity layer from docs-only synthesis ✅ COMPLETED
**Owner:** Ollama/Minimax for planning + Codex for implementation
**Goal:** Add waiting-on and drift signals using runtime/task outcomes where safe.
**Scope:** `scripts/generate-continuity-status.mjs`, `src/components/ContinuityPanel.jsx`, docs if changed
**Validate:** generate continuity output + `npm run build`
**Done when:** continuity panel is materially more truthful and useful
**Completed:** 2026-04-21 22:30
**Changes:**
- `scripts/generate-continuity-status.mjs`: Major v2 upgrade
  - Added OpenClaw bridge data ingestion (`openclaw-status.json`)
  - Implements session deduplication by sessionId to avoid duplicates
  - Added runtime analysis with `analyzeRuntime()` function:
    - Detects active sessions (direct sessions < 15 min old)
    - Computes stale sessions (idle 5-15 min) and drift sessions (idle > 15 min)
    - Generates waiting-on signals for user, subagent, and system states
    - Creates drift signal alerts for stale/drifted sessions
    - Checks cron health for failed jobs
    - Computes stale risk levels (low/medium/high) from runtime state
  - Added `formatDuration()` helper for human-readable time formatting
  - Merges docs-based tasks with runtime-based waiting-on signals
  - Determines primary mode from combined state (idle/acting/waiting_on_user/waiting_on_tool)
  - Outputs `version: "2.0-runtime-aware"` for tracking
- `scripts/generate-continuity-status.mjs`: REFINEMENT (22:30) — Aggregated stale sessions
  - Added `aggregateStaleSessions()` function to bucket idle sessions by time
  - Buckets: < 1h, < 6h, < 24h, 1d+ 
  - Drift signals now show aggregated summary: "73 idle sessions: 1 < 1h, 4 < 6h, 19 < 24h, 49 1d+, oldest 397h"
  - Eliminates graveyard of individual session listings
  - Returns `staleSummary` object with total, buckets, oldestSessionAge
- `src/components/ContinuityPanel.jsx`: Enhanced display layer
  - Added mode icons and labels (idle, acting, waiting_on_user, waiting_on_tool, blocked, delivered)
  - Added severity colors for waiting-on items (high/medium/low/normal)
  - Added stale risk color coding (low=emerald, medium=amber, high=rose)
  - New "Active Sessions" section showing live session badges with type colors
  - Session badges display id, model, and age for each active session
  - Added "Drift Signals" section with warning styling for stale/drift states
  - REFINEMENT: Updated drift signals display to handle object format with severity
  - REFINEMENT: Added compact stale session graveyard summary (buckets display)
  - REFINEMENT: Added fallback "Session State" amber box when no drift signals but stale sessions exist
  - Added gateway offline warning indicator
  - Three-column layout: Doing now (with waiting-on overlay), Just completed, Next
  - Footer notes explaining the new v2 runtime-aware behavior
**Validation:** Build successful ✅
**Continuity output:** Generates accurate runtime-aware status with drift detection
**Staleness aggregation:** 73 idle sessions now summarized in 4 buckets vs. 73 individual entries

#### Task N5 — Harden OpenClaw runtime truth ✅ COMPLETED
**Owner:** Codex / coding agent
**Goal:** Improve `openclaw-status.json` quality and reduce placeholder/degraded summaries.
**Scope:** `scripts/openclaw-bridge.mjs`, `src/components/SystemsTelemetrySidebar.jsx`
**Validate:** bridge run + `npm run build`
**Done when:** runtime panel better reflects real system state with cleaner summaries
**Completed:** 2026-04-21 23:18
**Changes:**
- `scripts/openclaw-bridge.mjs` v2.0-runtime-truth:
  - Fixed model health detection: Now correctly extracts primary model from `agents.defaults.model.primary`, `defaultModel`, and `resolvedDefault` paths
  - Added `extractAuthSummary()` function to analyze auth profiles and detect issues
  - Model health now considers: primary model present + working auth + no auth issues
  - Enhanced `analyzeSessions()` to compute session breakdowns by type (whatsapp/subagent/cron/other) and model
  - Added `parseCronJobs()` to extract structured job data from `openclaw cron list` output
  - Improved summaries: Sessions show active/recent/idle counts; Cron shows running/idle/failed counts
  - Added version field `"2.0-runtime-truth"` for tracking
  - Better error handling with fallback commands for task health
- `src/components/SystemsTelemetrySidebar.jsx`:
  - Removed placeholder "awaiting run feed" text from Scheduled Automations section
  - Cron jobs now populate from live OpenClaw runtime data with real lastRun/nextRun values
  - WhatsApp status now computed from actual session data (counts whatsapp sessions)
  - Enhanced `RuntimeBridge` component with sub-detail lines for each metric
  - Added session model distribution widget showing which models are in use
  - Improved `shortLabel()` to handle new message formats
  - Added `shortModelName()` helper to clean up model names for display
  - Added version indicator in runtime header
  - Added timestamp showing when data was last updated
**Validation:** Build successful ✅
**Bridge output:** Correctly identifies models as healthy with proper primary model detection

### Wave 3 — Structural architecture documentation

#### Task N6 — Define Nova Hub mode architecture
**Owner:** Ollama/Minimax
**Goal:** Document target mode structure: Command, Explorer, Workspace, Powers, Automations.
**Scope:** project docs only
**Validate:** doc quality + consistency with current codebase
**Done when:** future structure is clear without forcing premature implementation
**Status:** ✅ COMPLETED — `docs/MODE-ARCHITECTURE.md` created

#### Task N7 — Define file-first vs MCP-first boundary
**Owner:** Ollama/Minimax
**Goal:** Document where file-first remains correct and where MCP should be introduced later.
**Scope:** project docs only
**Validate:** architecture consistency
**Done when:** MCP role is explicit and not hand-wavy
**Status:** ✅ COMPLETED — `docs/MCP-BOUNDARY.md` created

## Morning deliverable

By morning, João should get:
- summary of completed tasks
- list of changed files
- validation/build status
- explicit blockers if any remain

## Notes

Do not broaden into unrelated new systems tonight.
Keep focus on:
1. command home hierarchy
2. continuity/trust
3. runtime truth
4. architecture clarity
