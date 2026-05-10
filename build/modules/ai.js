/**
 * ai.js - Enemy AI system
 *
 * 4-state machine per enemy: chase → attack → retreat → collect
 * All movement respects wall collision.
 * Shooting uses reload time (frame-rate independent).
 */

import { gameState }              from './state.js';
import { CONFIG, BRAWLERS }       from './config.js';
import { fireBullet, collectGems, checkWallCollision } from './combat.js';

export function updateAI(dt) {
    const player = gameState.player;
    if (!player) return;

    for (const enemy of gameState.enemies) {
        if (enemy.respawning > 0) {
            enemy.respawning -= dt;
            if (enemy.respawning <= 0) {
                enemy.hp = enemy.maxHp;
                enemy.x = enemy.team === 'blue' ? 300 + Math.random() * 500 : CONFIG.WORLD_WIDTH - 800 + Math.random() * 500;
                enemy.y = 80 + Math.random() * (CONFIG.WORLD_HEIGHT - 160);
                enemy.invulnerable = 3000;
                delete enemy.respawning;
            }
            continue;
        }

        const target = _findTarget(enemy);
        if (target) {
            _updateEnemy(enemy, target, dt);
        } else {
            // No targets left (e.g. showdown winner)
            if (enemy.aiState !== 'collect') enemy.aiState = 'chase';
            _updateEnemy(enemy, enemy, dt); // Stand still or collect
        }
        _enforceSeparation(enemy);
        _clampToBounds(enemy);
        if (enemy.invulnerable > 0) enemy.invulnerable -= dt;
    }

    // Heist: enemies in range directly drain enemy safe
    if (gameState.gameMode === 'heist') {
        for (const enemy of gameState.enemies) {
            const targetSafe = enemy.team === 'red' ? gameState.safe : gameState.enemySafe;
            const d = Math.hypot(targetSafe.x - enemy.x, targetSafe.y - enemy.y);
            if (d < 350) {
                targetSafe.hp -= enemy.brawler.damage * 0.008 * dt;
            }
        }
    }
}

function _findTarget(entity) {
    let bestTarget = null;
    let minD = Infinity;

    // Check player
    const player = gameState.player;
    if (player && player.hp > 0 && player.team !== entity.team) {
        const d = Math.hypot(player.x - entity.x, player.y - entity.y);
        const isVisible = !player.inBush || (player.revealedTimer > 0) || (d < 180);
        if (isVisible && d < minD) { minD = d; bestTarget = player; }
    }

    // Check other AI
    for (const other of gameState.enemies) {
        if (other === entity || other.hp <= 0 || other.team === entity.team) continue;
        const d = Math.hypot(other.x - entity.x, other.y - entity.y);
        const isVisible = !other.inBush || (other.revealedTimer > 0) || (d < 180);
        if (isVisible && d < minD) { minD = d; bestTarget = other; }
    }

    return bestTarget;
}

function _updateEnemy(enemy, target, dt) {
    const dx      = target.x - enemy.x;
    const dy      = target.y - enemy.y;
    const distToTarget = Math.hypot(dx, dy);
    const angleToTarget = Math.atan2(dy, dx);

    switch (enemy.aiState) {
        case 'chase':   _chase(enemy, target, distToTarget, angleToTarget, dt);   break;
        case 'attack':  _attack(enemy, target, distToTarget, angleToTarget, dt);  break;
        case 'retreat': _retreat(enemy, target, distToTarget, angleToTarget, dt); break;
        case 'collect': _collect(enemy, dt);                                       break;
    }
}

// ── State Handlers ────────────────────────────────────────────────────────────

function _chase(enemy, target, dist, angle, dt) {
    const range = enemy.brawler.range * 60;

    // Transitions
    if (enemy.hp < enemy.maxHp * 0.3) { enemy.aiState = 'retreat'; enemy.aiTimer = 2200; return; }
    if (dist < range * 0.85 && target !== enemy) { enemy.aiState = 'attack';  enemy.aiTimer = 1200 + Math.random() * 1000; return; }
    if (dist > 850 && gameState.gameMode === 'gemGrab') { enemy.aiState = 'collect'; enemy.aiTimer = 3500; return; }

    // Move toward target with wall sliding
    if (target !== enemy) {
        _moveWithSlide(enemy, angle, enemy.speed);
        enemy.angle = angle;
    }
}

function _attack(enemy, target, dist, angle, dt) {
    enemy.aiTimer -= dt;
    enemy.angle    = angle;

    // Kite: maintain preferred distance
    const preferred = enemy.brawler.range * 45;
    if (dist < preferred * 0.6) {
        _moveWithSlide(enemy, angle + Math.PI, enemy.speed * 0.65); // back up
    } else if (dist > enemy.brawler.range * 60) {
        _moveWithSlide(enemy, angle, enemy.speed * 0.8); // close gap
    } else {
        // Strafe in enemy-specific direction for harder target
        _moveWithSlide(enemy, angle + (Math.PI / 2) * enemy.strafeDir, enemy.speed * 0.3);
    }

    // Shoot on reload cadence
    const now = Date.now();
    if (now - enemy.lastShot > enemy.brawler.reload * 1100 && target !== enemy) {
        enemy.lastShot = now;
        fireBullet(enemy, enemy.brawler.damage * 0.65, enemy.team);
    }

    // Return to chase when timer expires or out of range
    if (enemy.aiTimer <= 0 || dist > enemy.brawler.range * 80 || target === enemy) {
        enemy.aiState = 'chase';
    }

    // Re-retreat if hp dropped
    if (enemy.hp < enemy.maxHp * 0.25) { enemy.aiState = 'retreat'; enemy.aiTimer = 2500; }
}

function _retreat(enemy, target, dist, angle, dt) {
    enemy.aiTimer -= dt;

    // Run directly away
    _moveWithSlide(enemy, angle + Math.PI, enemy.speed * 1.25);
    enemy.angle = angle + Math.PI;

    if (enemy.aiTimer <= 0 || enemy.hp > enemy.maxHp * 0.55) {
        enemy.aiState = 'chase';
    }
}

function _collect(enemy, dt) {
    enemy.aiTimer -= dt;

    // Find closest uncollected gem
    let nearestGem  = null;
    let nearestDist = Infinity;
    for (const gem of gameState.gems) {
        if (gem.collected) continue;
        const d = Math.hypot(gem.x - enemy.x, gem.y - enemy.y);
        if (d < nearestDist) { nearestDist = d; nearestGem = gem; }
    }

    if (nearestGem && nearestDist < 700) {
        const angle = Math.atan2(nearestGem.y - enemy.y, nearestGem.x - enemy.x);
        _moveWithSlide(enemy, angle, enemy.speed);
        enemy.angle = angle;
        if (nearestDist < enemy.radius + nearestGem.radius + 10) {
            collectGems(enemy);
        }
    } else {
        enemy.aiState = 'chase';
    }

    if (enemy.aiTimer <= 0) enemy.aiState = 'chase';
}

// ── Movement Helpers ──────────────────────────────────────────────────────────

function _moveWithSlide(enemy, angle, speed) {
    const mx = Math.cos(angle) * speed;
    const my = Math.sin(angle) * speed;

    const nx = enemy.x + mx;
    const ny = enemy.y + my;

    if (!checkWallCollision(nx, enemy.y, enemy.radius, true)) {
        enemy.x = nx;
    } else {
        // Try perpendicular slides (Y axis) since X is blocked
        if (!checkWallCollision(enemy.x, enemy.y + speed, enemy.radius, true)) enemy.y += speed * 0.6;
        else if (!checkWallCollision(enemy.x, enemy.y - speed, enemy.radius, true)) enemy.y -= speed * 0.6;
    }

    if (!checkWallCollision(enemy.x, ny, enemy.radius, true)) {
        enemy.y = ny;
    } else {
        // Try perpendicular slides (X axis) since Y is blocked
        if (!checkWallCollision(enemy.x + speed, enemy.y, enemy.radius, true)) enemy.x += speed * 0.6;
        else if (!checkWallCollision(enemy.x - speed, enemy.y, enemy.radius, true)) enemy.x -= speed * 0.6;
    }
}

function _enforceSeparation(enemy) {
    for (const other of gameState.enemies) {
        if (other === enemy) continue;
        const dx   = enemy.x - other.x;
        const dy   = enemy.y - other.y;
        const dist = Math.hypot(dx, dy);
        const min  = enemy.radius + other.radius + 8;
        if (dist < min && dist > 0.1) {
            const push = (min - dist) * 0.25;
            const px   = (dx / dist) * push;
            const py   = (dy / dist) * push;
            if (!checkWallCollision(enemy.x + px, enemy.y, enemy.radius, true)) enemy.x += px;
            if (!checkWallCollision(enemy.x, enemy.y + py, enemy.radius, true)) enemy.y += py;
        }
    }
}

function _clampToBounds(enemy) {
    enemy.x = Math.max(enemy.radius, Math.min(CONFIG.WORLD_WIDTH  - enemy.radius, enemy.x));
    enemy.y = Math.max(enemy.radius, Math.min(CONFIG.WORLD_HEIGHT - enemy.radius, enemy.y));
}

// ── Spawn ─────────────────────────────────────────────────────────────────────

export function spawnEnemies() {
    const isShowdown = gameState.gameMode === 'showdown';
    const count = isShowdown ? 9 : 5; // 9 enemies for showdown, 5 for 3v3 (2 blue, 3 red)
    const brawlerIds = Object.keys(BRAWLERS);

    gameState.enemies = [];

    for (let i = 0; i < count; i++) {
        const bid = brawlerIds[i % brawlerIds.length];
        
        let team;
        if (isShowdown) {
            team = `enemy_${i}`; // Unique team for Battle Royale
        } else {
            // First 2 are blue (allies), remaining 3 are red (enemies)
            team = i < 2 ? 'blue' : 'red';
        }

        let x, y;
        do {
            x = 80 + Math.random() * (CONFIG.WORLD_WIDTH  - 160);
            y = 80 + Math.random() * (CONFIG.WORLD_HEIGHT - 160);
            
            // In Heist/GemGrab, spawn them roughly on their side
            if (!isShowdown) {
                if (team === 'blue') x = 300 + Math.random() * 500;
                else x = CONFIG.WORLD_WIDTH - 800 + Math.random() * 500;
            }
        } while (Math.hypot(x - CONFIG.WORLD_WIDTH / 2, y - CONFIG.WORLD_HEIGHT / 2) < 600 && isShowdown);

        gameState.enemies.push(_createEnemy(x, y, bid, team));
    }

    gameState.playersLeft = isShowdown ? count + 1 : undefined;
}

function _createEnemy(x, y, brawlerId, team) {
    const brawler = BRAWLERS[brawlerId] ?? BRAWLERS.bear;
    return {
        x, y,
        team,
        radius: CONFIG.ENEMY_RADIUS,
        hp: brawler.hp, maxHp: brawler.hp,
        speed: brawler.speed / 100 * 0.72,
        angle: 0,
        brawler,
        gems: 0,
        powerCubes: 0,
        lastShot: Date.now() + Math.random() * 2000,
        aiState: 'chase',
        aiTimer: 0,
        invulnerable: 0,
        strafeDir: Math.random() < 0.5 ? 1 : -1
    };
}
