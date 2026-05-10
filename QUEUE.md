# Noah Brawl Stars Queue

## ACTIVE

### HIGH
- [x] Implement a "Brawl Pass" style seasonal progression system:
    - [x] Add experience points (XP) and levels for the overall account.
    - [x] Create a tiered reward track (Free and Premium) with coins, gems, and skins.
    - [x] Implement a "Daily Quest" system (e.g., "Deal 5000 damage", "Get 3 kills") to drive engagement.
    - [x] Add a progression UI screen to view rewards and current XP.

- [ ] Implement Brawler Upgrades (Power Levels):
    - Allow spending coins to increase Brawler HP and Damage (+5% per level).
    - Add a "Level Up" button and cost scaling on the brawler select screen.

### MEDIUM
- [x] Implement a more robust AI system:
    - Add "State-based" AI (Patrol, Chase, Retreat, Ambush).
    - Implement better obstacle avoidance and flanking behavior.
    - Add "Team Coordination" for enemies in Gem Grab (one protects, one attacks).

- [ ] Add a "Brawler Gallery" / Profile view:
    - Allow players to inspect brawlers, change skins, and view stats.
    - Show current level and trophy count per brawler.

- [x] Implement "Brawl-specific" combat mechanics:
    - Add "Pushback" (knockback) on heavy hits.
    - Add "Stun" or "Slow" effects to certain gadgets/supers.
    - Add "Wall-break" capability for some supers.

### LOW
- [ ] Add more brawlers (e.g., a healer or a long-range sniper with a slow reload).
- [ ] Implement a "Replay" or "Match History" log.
- [ ] Add dynamic environment events (e.g., falling debris, moving platforms).

## WORKING RULES
- Only mark done after live validation
- If a task reveals a deeper blocker, add the blocker under HIGH or MEDIUM
- Keep this queue current after each meaningful work cycle
- Prefer fewer, bigger improvements over noisy tiny edits

### ROADMAP FROM EVALUATION REPORT
- [x] Step 1 — Fix the "Try Again" flow and add proper menu navigation.
- [x] Step 2 — Add Showdown & Heist HTML HUDs.
- [x] Step 3 — Redesign maps to be structured, tiled arenas instead of random noise.
- [x] Step 4 — Implement proper multi-shot / spread mechanics per brawler.
- [x] Step 5 — Add proper ammo visualization as individual pips and fix the regen timer.
- [x] Step 6 — Add 3v3 team logic for Gem Grab and Heist.
- [x] **Character Animation**: Implement walking bob and squash/stretch (2026-05-01)
- [x] **Pop-Aesthetic Sprites**: Redesign all 9 brawlers for vibrant "Brawl Stars" look (2026-05-01)
- [x] **Death Feedback**: Added screen shake on elimination (2026-05-01)
- [ ] Step 7 — Build a proper brawler roster with 8–10 characters. (In Progress: All 9 Redesigned)
- [ ] Step 8 — Overhaul the Super system with a visible button glow and distinct per-brawler animations.
- [x] Step 9 — Add bush stealth mechanics. (Implemented)
- [ ] Step 10 — Implement a trophy / progression system with persistent state.
- [x] Step 11 — Add a full-screen respawn system for Gem Grab and Heist. (Implemented)
- [ ] Step 12 — Redesign the camera with smooth lerp and combat zoom-out.
- [ ] Step 13 — Add visual juice: hit-stop freeze frames, brawler-specific hit sounds, and a kill banner.
- [x] Step 14 — Build a proper mini-map / radar. (Implemented)
- [ ] Step 15 — Add a match-start countdown and pre-game lobby screen.
- [x] Step 16 — Fix and expand the Showdown gas with correct dt-scaling and a visual warning ring. (Implemented)
- [ ] Step 17 — Implement a Heist attack-bonus zone.
- [x] Step 19 — Polish the UI to match Brawl Stars' visual language.
- [x] Step 20 — Add simple matchmaking simulation and a loading/entry animation.
- [x] **Bush Stealth Refinement**: Add rustle particles when entering/exiting bushes (2026-05-01)
- [x] **Destructible Environment**: Allow supers to break walls (Ironclad/Solar Paws) (2026-05-01)
- [x] **Kill Banner**: Centered UI feedback for eliminations (2026-05-01)
