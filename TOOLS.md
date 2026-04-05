# TOOLS.md — Environment-Specific Configuration

**Last Updated:** 2026-04-05  
**Rule:** This file contains YOUR specific setup — API keys, SSH hosts, preferences

---

## 🤖 AI Models & Brain Configuration

### Hardware: MacBook Air 16GB unified RAM — budget matters!

### Current Model Chain (as of 2026-04-05)
| Role | Model | Provider | RAM | Context | Notes |
|------|-------|----------|-----|---------|-------|
| **Primary** | `ollama/minimax-m2.5:cloud` | Ollama Cloud via local Ollama sign-in | 0 local VRAM | 125K | ✅ Cloud-first primary to reduce local memory pressure |
| **Fallback #1** | `openai-codex/gpt-5.4` | Cloud (OAuth) | 0 | 266K | ✅ Reliable fallback for tool-heavy runs |
| **Fallback #2** | `google-gemini-cli/gemini-2.5-flash` | Cloud (OAuth) | 0 | 1M | ✅ Fast Gemini fallback |
| **Fallback #3** | `google-gemini-cli/gemini-2.5-pro` | Cloud (OAuth) | 0 | 1M | ✅ Higher-capability Gemini fallback |

### Available But Not In Active Fallback Chain
| Model | Reason |
|------|--------|
| `ollama/qwen2.5-coder:14b` | Keep as manual coding override / subagent model |
| `ollama/kimi-k2.5:cloud` | Keep available for manual use/reintroduction after quota resets; has previously hit usage-limit cooldowns |

### ⚠️ Known Quota Issues
- `google-gemini-cli/gemini-2.5-flash`: ✅ Confirmed healthy via OpenClaw runtime test on 2026-04-05.
- `google-gemini-cli/gemini-2.5-pro`: ✅ Confirmed healthy via OpenClaw runtime test on 2026-04-05.
- Standalone raw `gemini` shell CLI currently lacks local auth file visibility, but OpenClaw runtime OAuth path works.
- `openai-codex/gpt-5.4`: OAuth healthy; use as first fallback when primary lane is unstable.
- `ollama/*:cloud`: Auth is handled by local `ollama signin`; OpenClaw sees Ollama as static/api-key profile while cloud auth remains in Ollama.
- **Rule:** Keep the active chain as cloud Ollama → Codex → Gemini unless a new validated incident requires re-ordering.

---

### ☁️ Ollama Cloud Notes (as of 2026-04-05)

- Local Ollama is signed in (`ollama signin`) and can run cloud models through localhost.
- For direct remote API use (`https://ollama.com/api`), use `OLLAMA_API_KEY` with Bearer auth.
- In OpenClaw model status, Ollama may still appear as static/api-key profile even when cloud auth is handled by the Ollama app/session.
- Current lightweight cloud default in OpenClaw: `ollama/minimax-m2.5:cloud`.

---

---

## 🔐 API Keys & Credentials

### Google / Gemini
- **Gemini CLI OAuth:** ✅ Authenticated (João's account)
- **Gmail API:** ❌ Not yet configured
- **Calendar API:** ❌ Not yet configured
- **Drive API:** ❌ Not yet configured

*Note: Add client_id, client_secret when Gmail OAuth is set up*

### Other Services
| Service | API Key | Notes |
|---------|---------|-------|
| [To be filled] | | |

---

## 🖥️ SSH Hosts

| Alias | Host | User | Notes |
|-------|------|------|-------|
| [To be filled] | | | |

---

## 📂 Preferences

### Communication
- Preferred summary format: Bullet points
- Daily check-ins: Morning preferred (TBD exact time)
- Urgent vs batched: WhatsApp urgent, else batched 2-3x daily

### Processing
- YouTube analysis: Extract 3-5 concepts, link to interests
- Meeting transcripts: Extract decisions, action items, stakeholders
- File naming: YYYY-MM-DD-[descriptor]-[hash]

### Workspace
- Default editor: [TBD]
- Git remote: [TBD — for workspace backup]

---

## 🔧 Custom Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| [To be filled] | | |

---

## 📝 Extraction Rules

### YouTube Videos
```
Required fields:
- Title, channel, duration
- 3-5 key concepts
- Why relevant (link to João's interests)
- Keywords for search
- Related to Miele? (yes/no/maybe)

Optional:
- Transcript summary
- Action items for João
```

### Meeting Transcripts
```
Required fields:
- Date, participants, meeting type
- Key decisions made
- Action items (who, what, when)
- Open questions
- Link to Miele projects

Optional:
- Stakeholder sentiment
- Follow-up meetings scheduled
```

---

*Add new tools/preferences as we discover them*
