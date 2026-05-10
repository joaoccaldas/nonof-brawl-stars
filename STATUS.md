# Noah's Brawl Stars — Project Status

**Last updated:** 2026-04-27  
**Server:** `http://localhost:8765` (run `./serve.sh` or `caddy run --config Caddyfile`)  
**Entry:** `build/index.html` → `build/main.js` — plain ES modules, no build step needed

---

## File Map

```
build/
  index.html        ← HTML + CSS only. <script type="module" src="./main.js">
  main.js           ← Orchestrator: game loop, all game-feel systems, HUD wiring
  modules/
    config.js       ← Pure constants — CONFIG, BRAWLERS, GAME_MODES
    state.js        ← gameState singleton + initPlayer
    input.js        ← Keyboard / mouse aim / touch joystick / attack+super buttons
    combat.js       ← fireBullet, activateSuper, updateBullets, checkBulletHits
    ai.js           ← 4-state machine (chase/attack/retreat/collect) + spawnEnemies
    render.js       ← All canvas drawing, procedural sprites, camera, effects
  sprites/          ← Legacy image files (no longer loaded; sprites are procedural)
```

**Dependency graph (no cycles):**
```
main.js → config, state, input, render, combat, ai
ai      → state, config, combat
render  → state, config
combat  → state, config
input   → state
state   → config
```

---

## What Works

| System | Status | Detail |
|---|---|---|
| Canvas visible | ✅ | z-index fixed; animated-bg behind canvas |
| Landing → select → game flow | ✅ | Full screen transitions |
| Keyboard (WASD/arrows) | ✅ | Normalized diagonal |
| Touch joystick | ✅ | Dead-zone, 55px radius |
| Mouse aiming | ✅ | Camera-offset corrected |
| Shooting (Space / click / tap) | ✅ | 3-ammo mag, per-ammo regen |
| Super ability — E / gold button | ✅ | Gated at 100% charge, bar + ready pulse |
| Bear super (Solar Blast) | ✅ | 12 radial bullets |
| Caveman super (Primal Rage) | ✅ | 5s speed + 1.5× damage |
| Eagle super (Eagle Strike) | ✅ | 3 piercing sniper shots |
| Procedural sprites | ✅ | Bear (ears/face/aura), Caveman (hair/club/teeth), Eagle (wings/eye/beak) |
| Brawler select preview | ✅ | Emoji glyphs on mini canvases |
| Enemy AI state machine | ✅ | chase→attack→retreat→collect |
| Enemy wall collision + sliding | ✅ | Enemies no longer walk through walls |
| Enemy reload-based shooting | ✅ | Uses brawler.reload, staggered start |
| Enemy separation steering | ✅ | Enemies don't pile on top of each other |
| Enemy strafe direction | ✅ | Per-enemy CW/CCW, avoids synchronized circling |
| Enemy boundary clamping | ✅ | Can't leave world bounds |
| Knockback on hit | ✅ | 22px push, wall-clamped |
| Damage numbers | ✅ | Floating red numbers on each hit |
| Screen shake | ✅ | Intensity scales with hit type; decays per frame |
| Death ring burst | ✅ | Expanding colored ring + 20 particles on kill |
| Hit particles | ✅ | Color-matched, fade 380ms |
| Ammo crate pickups | ✅ | 7 crates on map, +2 ammo, 12s respawn, pickup text |
| Gem Grab mode | ✅ | Collect 10, team/enemy gem counter live |
| Showdown mode | ✅ | 9 enemies, gas ring shrinks |
| Heist mode | ✅ | Safe HP bars drawn, enemy proximity drain, bullet damage |
| Health bar color | ✅ | Green → yellow → red by HP% |
| Enemy health bars | ✅ | Per-enemy bar above head |
| Gem badge on entity | ✅ | When carrying ≥1 gem |
| Timer | ✅ | MM:SS countdown |
| Victory/Defeat screens | ✅ | Mode-aware summary text |

---

## Known Gaps / Next Up

| Area | Notes |
|---|---|
| Audio | No SFX or music — biggest remaining feel gap |
| More brawlers | 3 playable; need 8–10 for replayability |
| Death animation | Enemies vanish instantly (no fade/stagger) |
| AI pathfinding | Wall-sliding works but no A* around complex obstacles |
| Showdown HUD | Players remaining count not displayed |
| Heist HUD | Safe HP not shown in HUD (only on safe itself) |
| Gadgets / Star Powers | Config fields exist, not implemented |
| Damage numbers on safe | Heist safe hits have no floating number |
| Enemy gem drop visibility | Gem drops on kill but no "dropped!" text |
| Progression | ✅ | Trophy Road (0-4000) and Daily Quests implemented with persistence |

---

## Changes — 2026-04-27

### Critical fixes
- **Canvas invisible**: `.animated-bg` (`position:fixed`) stacked above the static canvas. Fixed with `z-index:-1` on animated-bg, `z-index:0` on canvas, `z-index:10` on game-ui.
- **All `?v=3` cache params** stripped from module imports.
- **`input.js`**: added `import { gameState }` — fixed undefined in `handleMouseMove`.
- **`ai.js`**: replaced hardcoded `16` frame-time with real `dt` in all state handlers.
- **`render.js`**: removed stray `console.log` in `drawWorld`.
- **`state.js`**: added `lastAmmoTime` to player init.

### New systems (main.js)
- Particle system (hit sparks, death burst, gem pickup, super flash)
- Floating damage numbers (Bangers font, fade-up over 900ms)
- Screen shake (intensity-matched to hit type, 0.72× decay per frame)
- Death ring animation (expanding colored ring, 520ms)
- Ammo crate mechanic (7 crates, +2 ammo, 12s respawn, pickup text)
- Correct per-ammo reload (one bullet per `reload × 1000ms`)
- Super button "READY" pulse animation when charge ≥ 100%
- Health bar color shifts green → yellow → red

### Enemy AI (ai.js rewrite)
- Wall-sliding on all movement states (try perpendicular if blocked)
- World-boundary clamping
- Entity-entity separation steering
- Per-enemy strafe direction (avoids synchronized circling)
- Reload-based shooting instead of random 3% per frame
- Staggered initial shots (random 0–2s delay per enemy)
- Heist mode: safe HP drained proportionally to dt (not per-frame)

### 🎨 New Pop-Aesthetic & Animation — 2026-05-01
- **All 9 Procedural Brawlers Redesigned**: Moved away from generic RPG tropes to "Brawl Stars" pop designs (sunglasses, headsets, neon colors).
  - **Solar Paws (Bear)**: Pro-gamer bear with VR goggles and headset.
  - **Punk Bonker (Caveman)**: Rebel with pink mohawk and leopard club.
  - **Aviator Ace (Eagle)**: Pilot with helmet and red aviation goggles.
  - **Shadow DJ (Hex)**: Purple headphones and digital neon mask.
  - **Mecha-Unit (Ironclad)**: Cyclops robot with hazard stripes and glowing eye.
  - **Cyber Ninja (Blade)**: Neon headband and digital scarf.
  - **Hooded Gamer (Archer)**: Tech visor and energy bow.
  - **Bio-Healer (Medic)**: Cross visor and medical tech.
  - **Blast King (Bombardier)**: TNT crown and royal red cape.
- **Dynamic Animation Engine**: 
  - Added **Squash & Stretch** (1.05× scale shift) when walking.
  - Added **Walking Bob** (6px sine wave) based on movement cycles.
  - Added **Ground Shadow Scaling** (shadow shrinks as brawler bobs up).
- **Juice & Feedback**:
  - **Screen Shake on Kill**: Triggered on every elimination (intensity 15-30).
- **Interactive Environments — 2026-05-01**:
  - **Destructible Walls**: Solar Paws and Mecha-Unit Supers now break wall tiles, altering the map layout mid-match.
  - **Bush Interaction**: Added leaf particles that spawn when entities move through bushes, enhancing the stealth feel.
  - **Kill Banners**: Implemented a centered, high-contrast UI banner for eliminations.

---

## Controls

| Action | Keyboard | Mobile |
|---|---|---|
| Move | WASD / arrows | Left joystick |
| Aim | Mouse | Follows joystick |
| Shoot | Space / left-click | Red button |
| Super | E | Gold button (pulses when ready) |
