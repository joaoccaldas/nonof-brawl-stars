# AI Agent Tooling — Evaluation & Integration Notes

*Created: 2026-05-15*
*Purpose: Track coding agents, CLI tools, and AI platforms we evaluate for integration into workflows*

---

## Evaluated Tools

### OpenAI Codex CLI + Mobile Control
- **Launched:** May 14, 2026
- **What it is:** Agentic coding tool that runs on your machine, now controllable from ChatGPT mobile app
- **Pricing:** Free tier available; higher tiers for more usage
- **Key feature:** Secure relay layer — machine stays private, phone gets real-time sync (screenshots, diffs, terminal, approvals)
- **Use case fit:** Start tasks from Mac, approve/monitor from phone. Great for long-running refactors, bug investigation, test runs
- **Integration status:** ⬜ Not yet integrated — monitor only
- **Evaluation:** Best-in-class mobile control story. If you already use ChatGPT daily, the friction is near zero. Worth testing for side-project automation when a long-running agent task needs your judgment mid-flight.

### xAI Grok Build CLI
- **Launched:** May 14, 2026 (early beta)
- **What it is:** Terminal-native coding agent from xAI, competing with Claude Code and Codex CLI
- **Pricing:** $300/month (SuperGrok Heavy) during beta; expect price drops when GA
- **Key feature:** Plan Mode — proposes step-by-step before executing; parallel subagent architecture for large codebases
- **Use case fit:** Complex refactors where surprise execution is dangerous; large monorepo work
- **Integration status:** ⬜ Not yet integrated — blocked on pricing
- **Evaluation:** Plan Mode is genuinely differentiated. If xAI drops price to ~$50-100/mo for pro tier, becomes competitive. Watch for GA pricing. Current $300 is too high for side-project use.

### X/Twitter Algorithm (Open Source)
- **Status:** Open-sourced since March 2023; Grok-powered update January 2026
- **What it is:** Only major social platform with fully public ranking weights and logic
- **Key insight:** Engagement weights are public — reply-to-author-response = 150x a like
- **Use case fit:** Audience building, thought leadership, marketing any side business
- **Integration status:** ⬜ Not yet integrated — strategic knowledge only
- **Evaluation:** If you ever use X for professional visibility, this is a cheat sheet. The 150x conversation-depth signal means: reply to everyone who engages with you. Text-only posts beat video by 30%. External links are penalized 30-50%. Premium = ~10x reach.

---

## Integration Priority Matrix

| Tool | Priority | Blocker | Next Action |
|------|----------|---------|-------------|
| Codex Mobile | Medium | Need a test project | Pick a small side-project refactor; try mobile approval flow |
| Grok Build CLI | Low | $300/mo beta pricing | Monitor GA pricing; re-evaluate if <$100/mo |
| X Algorithm | Low-Medium | Not actively posting on X | If you restart X for thought leadership, apply the engagement playbook |

---

## Open Questions

1. Does Codex mobile support model switching (e.g., to cheaper model for simple tasks)?
2. How does Grok Build CLI compare to Claude Code on real-world speed + accuracy?
3. Would an X automation workflow (auto-reply strategy) be worth building as a side project?

---

## Related
- `MEMORY.md` → Model routing, fallback chain
- `TOOLS.md` → Current CLI tooling stack
- `AGENTS.md` → When to spawn coding agents
