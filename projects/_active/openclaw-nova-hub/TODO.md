# Nova Hub Enhancement — Jarvis Dashboard

## Goal
Transform Nova Hub from project overview into a true Jarvis-like command center: visibility into system state, OpenClaw health, active sessions, and quick actions.

## Phase 1: System Health Bridge (Next)
- [ ] Create `scripts/system-bridge.mjs` — Node script that polls:
  - CPU load, RAM usage, disk space (via `top`, `vm_stat`, `df`)
  - Mac temps (via `powermetrics` or `istats`)
  - Network status
  - Outputs to `public/system-status.json`
- [ ] Add SystemStatus.jsx component — live gauges/stats
- [ ] Integrate into main UI (sidebar or header strip)

## Phase 2: OpenClaw Health API
- [ ] Create `scripts/openclaw-bridge.mjs`:
  - Gateway status (`openclaw gateway status`)
  - Model health (`openclaw models status --probe`)
  - Active sessions (`openclaw sessions list` or API)
  - Task queue state (`openclaw tasks list --running`)
  - Cron status (`openclaw cron list`)
  - Outputs to `public/openclaw-status.json`
- [ ] Add OpenClawStatus.jsx — colored indicators for health
- [ ] Add Pulse widget showing current active work

## Phase 3: Quick Actions Panel
- [ ] Create ActionButton.jsx components
- [ ] Wire to backend bridge that can execute (safely scoped):
  - Restart gateway
  - Run heartbeat check
  - Kill stuck tasks
  - Trigger cron job
  - Switch model fallback
- [ ] Confirmation dialogs for destructive actions

## Phase 4: Nova Self-Status
- [ ] Show my current session state
- [ ] Active sub-agents list
- [ ] Recent completions/errors
- [ ] Model currently in use

## Phase 5: Voice/Quick Command
- [ ] Command palette (Cmd+K) for actions
- [ ] Optional: wake word trigger (future)

## Architecture Notes
- All bridges run as separate Node processes (or cron)
- UI polls JSON files (5s interval like projects)
- No heavy deps — keep it snappy on 16GB Mac
- Security: actions gated, no raw shell execution from UI

## First Task
Start Phase 1: scaffold `scripts/system-bridge.mjs` with CPU/RAM/disk polling.
