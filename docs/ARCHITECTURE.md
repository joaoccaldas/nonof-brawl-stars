# Noah's Brawl Stars - Architecture

**Date:** 2026-04-26  
**Status:** Modular refactor complete

---

## Directory Structure

```
projects/noah-brawl-stars/src/
├── index.html              # Minimal shell - loads modules
├── main.js                 # Entry point, game loop orchestration
├── styles/
│   └── main.css            # All styles (extracted from inline)
└── modules/
    ├── config.js           # Constants, brawler definitions, game modes
    ├── state.js            # gameState, input state, profile
    ├── input.js            # Keyboard, mouse, touch, joystick handlers
    ├── combat.js           # FIXED: Shooting, damage, bullets, supers
    ├── utils.js            # Particles, camera shake, sound, helpers
    └── entities/           # (future: player.js, enemy.js)
```

---

## Module Responsibilities

### config.js
- **Exports:** `CONFIG`, `BRAWLERS`, `GAME_MODES`
- **Contains:** All tunable constants, brawler stats, mode rules
- **Lines:** ~100
- **Dependencies:** None

### state.js
- **Exports:** `gameState`, `profile`, `input`, `resetGameState()`, `initPlayer()`
- **Contains:** Central game state, player profile, input state
- **Lines:** ~150
- **Dependencies:** config.js

### input.js
- **Exports:** `input`, `setupInputHandlers()`, `normalizeInput()`
- **Contains:** All input event listeners, joystick logic
- **Lines:** ~180
- **Dependencies:** state.js

### combat.js
- **Exports:** `updateCombat()`, `damageEnemy()`
- **Contains:** Shooting logic, bullet updates, damage calculation, supers, gadgets
- **Lines:** ~350
- **Dependencies:** config.js, state.js, utils.js

**CRITICAL FIXES APPLIED:**
1. **Attack timing bug fixed:** Now supports both tap and hold with proper queuing
2. **Bullet piercing:** Bullets track which enemies they've hit (`hitEnemies` Set)
3. **Damage logic:** Proper invulnerability timing, super charge on hits

### utils.js
- **Exports:** `spawnParticles()`, `updateParticles()`, `renderParticles()`, `shakeCamera()`, `updateCameraShake()`, `playSound()`, math helpers
- **Contains:** Visual effects, camera shake, utility functions
- **Lines:** ~120
- **Dependencies:** state.js

### main.js
- **Exports:** `selectBrawler()`, `selectMode()` (exposed to window)
- **Contains:** Game loop, update/render orchestration, screen management, persistence
- **Lines:** ~400
- **Dependencies:** All other modules

---

## Data Flow

```
Input (keyboard/touch)
    ↓
input.js → updates input state
    ↓
main.js gameLoop()
    ↓
    ├→ updatePlayer() - uses input.moveX/Y
    ├→ updateCombat() - uses input.shooting/superActive
    ├→ updateEnemies() - AI logic
    ├→ updateParticles() - visual effects
    └→ updateCamera() - camera follow + shake
    ↓
render() - draws everything
```

---

## Key Bug Fixes

### 1. Attack System (combat.js)

**Problem:** Original code required holding attack button for full reload time. Tapping didn't work.

**Solution:** Added attack queuing system:
```javascript
let attackQueued = false;

function handleAttack(player, brawler, now) {
    if (input.shooting) {
        if (!attackQueued) {
            attackQueued = true;  // New press detected
        }
        tryFire(player, brawler, now);  // Attempt to fire
    } else {
        attackQueued = false;  // Button released
    }
}
```

### 2. Bullet Logic (combat.js)

**Problem:** Bullets were destroyed after hitting ONE enemy. No piercing.

**Solution:** Added `hitEnemies` Set to track which enemies a bullet has hit:
```javascript
gameState.bullets.push({
    // ... bullet properties ...
    hitEnemies: new Set()  // Track hits for piercing
});

// In collision check:
if (b.hitEnemies.has(enemy.id)) continue;  // Already hit
// ... apply damage ...
b.hitEnemies.add(enemy.id);  // Mark as hit
```

### 3. Invulnerability Timing (combat.js)

**Problem:** Enemies had inconsistent invulnerability after being hit.

**Solution:** Standardized invulnerability timing:
- Player: `400ms` after being hit
- Enemy: `80ms` after being hit (prevents double-damage from same burst)

---

## Build Process

**Development:**
```bash
cd projects/noah-brawl-stars/src
# Serve directly - ES6 modules work in modern browsers
python3 -m http.server 8080
```

**Production:**
```bash
# Run export script to bundle
cd projects/noah-brawl-stars
./scripts/export.sh

# Creates:
# - build/noah-brawl-stars-v2.html (bundled)
# - public/noah-brawl-stars-v2.html (served)
```

---

## Module Size Compliance

| Module | Lines | Limit | Status |
|--------|-------|-------|--------|
| config.js | ~100 | 100 | ✅ |
| state.js | ~150 | 200 | ✅ |
| input.js | ~180 | 200 | ✅ |
| combat.js | ~350 | 300 | ⚠️ Slightly over (combat is complex) |
| utils.js | ~120 | 400 | ✅ |
| main.js | ~400 | 500 | ✅ |

---

## Future Improvements

1. **Split combat.js further:**
   - `weapons.js` - Bullet creation, weapon types
   - `supers.js` - Super ability implementations
   - `damage.js` - Damage calculation, hit detection

2. **Add entity modules:**
   - `entities/player.js` - Player-specific logic
   - `entities/enemy.js` - Enemy AI
   - `entities/brawler.js` - Brawler class

3. **Add mode modules:**
   - `modes/gemGrab.js`
   - `modes/showdown.js`
   - `modes/heist.js`

4. **Add UI modules:**
   - `ui/screens.js` - Screen management
   - `ui/hud.js` - In-game HUD rendering
   - `ui/controls.js` - Control rendering

---

## Testing Checklist

- [x] Game loads without errors
- [x] Can select brawler
- [x] Can select mode
- [x] Player moves with joystick/WASD
- [x] Player aims with mouse/touch
- [x] **Attack works with tap AND hold**
- [x] Bullets damage enemies
- [x] **Bullets can hit multiple enemies** (if piercing enabled)
- [x] Super charges and activates
- [x] Camera follows player
- [x] Screen shake on hits
- [x] Particles spawn on hits
- [x] Victory/defeat screens show
- [x] Progress saves to localStorage
