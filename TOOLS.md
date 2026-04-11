# TOOLS.md — Environment & Ops Reference

**Purpose:** Environment-specific setup + OpenClaw ops commands. For model routing rules, see `AGENTS.md`.

---

## Hardware

- **Machine:** MacBook Air, 16GB unified RAM (macOS)
- **Local AI RAM budget:** Keep local models lean — 16GB shared with everything

---

## Auth & Credentials

### Google / Gemini CLI
- **OAuth:** ✅ Authenticated (João's account)
- **Account:** `joaoccaldas@gmail.com`
- **Env:** `GOG_ACCOUNT=joaoccaldas@gmail.com`
- CLI binary: `gog` (`/opt/homebrew/bin/gog` or `/usr/bin/gog`)
- Available Google Workspace surfaces via `gog`: Gmail, Calendar, Drive, Contacts, Sheets, Docs
- Default rule: test `gog` directly before claiming Google Workspace access is unavailable

### Ollama
- Local daemon: `http://127.0.0.1:11434`
- Cloud model auth: `ollama signin` (weekly quota limits apply). After `ollama signin`, the local Ollama daemon automatically handles authentication and token management for cloud models. There is no explicit `ollama refresh-token` command. `ollama run <cloud-model-name>` serves as a robust probe to verify the entire authentication chain (local client auth, token acquisition, cloud service access).
- **Troubleshooting Tip**: If an Ollama cloud model is configured but not active, running `ollama pull <model-name>` (e.g., `ollama pull minimax-m2.5:cloud`) can often resolve underlying Ollama client issues by re-registering or activating the model's manifest.
#### Current Status
- `minimax-m2.5:cloud`: Rate limited since 2026-04-09T18:24:49Z. Reset hint: your weekly usage limit, upgrade for higher limits.

---

## Key Paths

| Item | Path |
|------|------|
| OpenClaw root | `~/.openclaw/` |
| Workspace | `~/.openclaw/workspace/` |
| Scripts | `~/.openclaw/workspace/scripts/` |
| Node bin | `~/.local/nodejs/current/bin/` |
| Homebrew bin | `/opt/homebrew/bin/` |
| Exec approvals | `~/.openclaw/exec-approvals.json` |
| Tasks DB | `~/.openclaw/tasks/runs.sqlite` |
| Gateway log | `/tmp/openclaw/openclaw-YYYY-MM-DD.log` |
| Gateway error log | `~/.openclaw/logs/gateway.err.log` |

---

## OpenClaw Ops Cheatsheet

### Gateway
```bash
openclaw gateway status
openclaw gateway restart
openclaw health
openclaw doctor
openclaw logs --follow
```

### Cron Jobs
```bash
# Create recurring job
openclaw cron add \
  --name "Job name" \
  --cron "0 7 * * *" \
  --tz "Europe/Stockholm" \
  --session isolated \
  --message "What the agent should do" \
  --announce --channel whatsapp --to "+46729623652"

# One-shot reminder
openclaw cron add \
  --name "Reminder" \
  --at "+30m" \
  --session main \
  --system-event "Reminder text" \
  --wake now \
  --delete-after-run

# Manage
openclaw cron list
openclaw cron status
openclaw cron runs --id <id> --limit 20
openclaw cron run <id>              # force run now
openclaw cron edit <id> --message "New prompt"
openclaw cron edit <id> --timeout 900
openclaw cron rm <id>
```

### Tasks (stuck task recovery)
```bash
openclaw tasks maintenance --apply
openclaw tasks audit
openclaw tasks show <task-id>

# Force-kill stuck tasks directly (use when CLI doesn't work)
sqlite3 ~/.openclaw/tasks/runs.sqlite \
  "UPDATE task_runs SET status='failed', ended_at=$(date +%s000), error='manually killed' WHERE status='running';"
```

### Models
```bash
openclaw models list
openclaw models status --probe --json
```

### Skills
```bash
openclaw skills list
openclaw skills check
openclaw skills search "keyword"
openclaw skills install <slug>
openclaw skills update --all
openclaw skills info <name>
```

---

## Custom Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| `model-self-heal.sh` | Model health self-healing | `~/.openclaw/scripts/` |
| `refresh-gemini-auth.sh` | Keep google-gemini-cli OAuth alive (crontab every 45min) | `~/.openclaw/scripts/` |

---

## Preferences

- **Communication:** WhatsApp for urgent; batched 2–3x daily for the rest
- **Summary format:** Bullet points
- **Platform formatting:** No markdown tables on WhatsApp/Discord — use bullet lists

## Capability Reminder

Before saying a service is inaccessible, verify the live path.

- Google Workspace: `gog`
- OpenClaw/session state: built-in tools like `session_status`, `sessions_*`, `gateway`
- Local/workspace files: `read`, `write`, `edit`, `exec`

Lack of immediate recall is not lack of capability.
