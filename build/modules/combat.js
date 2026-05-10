/**
 * combat.js - Combat system for Noah's Brawl Stars
 * 
 * Handles: shooting, bullets, damage, super abilities
 * Imports: state.js, config.js
 */

import { gameState } from './state.js';
import { CONFIG } from './config.js';
import {
    spawnParticles, spawnDmgNumber, spawnPickupText,
    spawnDeathRing, spawnZone, triggerShake, spawnExplosion
} from './effects.js';

/**
 * Fire a bullet from an entity
 * @param {Object} entity - The shooter (player or enemy)
 * @param {number} damage - Bullet damage
 * @param {string} owner - 'player' or 'enemy'
 * @param {boolean} isSuper - Is this a super attack
 */
export function fireBullet(entity, damage, owner, isSuper = false) {
    const speed = owner === 'player' ? 18 : 14;
    const range = entity.brawler.range * 60;
    
    // Reveal when shooting
    entity.revealedTimer = 1500;
    
    const shotCount = entity.brawler.shotCount || 1;
    const spread = entity.brawler.spread || 0;
    
    for (let i = 0; i < shotCount; i++) {
        let angleOffset = 0;
        if (shotCount > 1) {
            angleOffset = -spread / 2 + (spread / (shotCount - 1)) * i;
        }
        const bulletAngle = entity.angle + angleOffset;
        
        gameState.bullets.push({
            x: entity.x + Math.cos(bulletAngle) * 45,
            y: entity.y + Math.sin(bulletAngle) * 45,
            vx: Math.cos(bulletAngle) * speed,
            vy: Math.sin(bulletAngle) * speed,
            damage: damage,
            owner: owner,
            ownerTeam: entity.team,
            ownerEntity: entity,
            color: isSuper ? '#ffd700' : entity.brawler.color,
            particleType: entity.brawler.particleType || 'square',
            range: range,
            distance: 0,
            isSuper: isSuper,
            isThrower: entity.brawler.isThrower || false,
            isHealer: entity.brawler.isHealer || false,
            aoeRadius: entity.brawler.aoeRadius || 0,
            healAmount: entity.brawler.healAmount || 0
        });
    }
}

/**
 * Activate super ability based on brawler type
 * @param {Object} player - The player entity
 */
export function activateSuper(player) {
    const brawler = player.brawler;
    const now = Date.now();
    
    if (brawler.id === 'bear') {
        // Sun Bear - Solar Blast (radial explosion with knockback)
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i;
            gameState.bullets.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(angle) * 22,
                vy: Math.sin(angle) * 22,
                damage: player.superDamage || brawler.superDamage,
                ownerTeam: player.team,
                ownerEntity: player,
                color: '#ffd700',
                range: brawler.superRange * 60,
                distance: 0,
                isSuper: true,
                breaksWalls: true
            });
        }
        spawnParticles(player.x, player.y, '#ffd700', 30);
    } else if (brawler.id === 'caveman') {
        // Caveman - Primal Rage (speed + damage boost)
        player.rageActive = true;
        player.rageEndTime = now + 5000;
        spawnParticles(player.x, player.y, '#ff4400', 15);
    } else if (brawler.id === 'eagle') {
        // Eagle Eye - Eagle Strike (Sniper Arrow)
        gameState.bullets.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(player.angle) * 35,
            vy: Math.sin(player.angle) * 35,
            damage: player.superDamage || brawler.superDamage,
            ownerTeam: player.team,
            ownerEntity: player,
            color: '#ffd700',
            range: brawler.superRange * 80,
            distance: 0,
            isSuper: true,
            pierce: true,
            radius: 20
        });
    } else if (brawler.id === 'bombardier') {
        // Bombardier - Big One (Massive AOE Bomb)
        gameState.bullets.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(player.angle) * 12,
            vy: Math.sin(player.angle) * 12,
            damage: brawler.superDamage,
            ownerTeam: player.team,
            ownerEntity: player,
            color: '#ff4400',
            range: brawler.superRange * 60,
            distance: 0,
            isSuper: true,
            isThrower: true,
            breaksWalls: true,
            aoeRadius: 280
        });
    } else if (brawler.id === 'medic') {
        // Medic - instantly restore 30% max HP
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.3);
        spawnParticles(player.x, player.y, '#00ff88', 25);
    } else if (brawler.id === 'hex') {
        // Hex - Witch Hex: 10 poison bolts in all directions
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 / 10) * i;
            gameState.bullets.push({
                x: player.x, y: player.y,
                vx: Math.cos(angle) * 13, vy: Math.sin(angle) * 13,
                damage: brawler.superDamage,
                owner: 'player', ownerTeam: player.team, ownerEntity: player,
                color: '#cc44ff',
                range: brawler.superRange * 60,
                distance: 0, isSuper: true
            });
        }
        spawnParticles(player.x, player.y, '#9932CC', 22);
    } else if (brawler.id === 'ironclad') {
        // Ironclad - Armored Charge: 3 heavy blasts in spread
        for (let i = -1; i <= 1; i++) {
            const a = player.angle + i * 0.28;
            gameState.bullets.push({
                x: player.x + Math.cos(a) * 45, y: player.y + Math.sin(a) * 45,
                vx: Math.cos(a) * 21, vy: Math.sin(a) * 21,
                damage: brawler.superDamage,
                owner: 'player', ownerTeam: player.team, ownerEntity: player,
                color: '#b0c8e0',
                range: brawler.superRange * 60,
                distance: 0, isSuper: true, superKnockback: 55,
                breaksWalls: true
            });
        }
        spawnParticles(player.x, player.y, '#708090', 15);
    } else if (brawler.id === 'blade') {
        // Blade - Shadow Storm: 5 fast shurikens in fan
        for (let i = -2; i <= 2; i++) {
            const a = player.angle + i * 0.22;
            gameState.bullets.push({
                x: player.x + Math.cos(a) * 45, y: player.y + Math.sin(a) * 45,
                vx: Math.cos(a) * 28, vy: Math.sin(a) * 28,
                damage: brawler.superDamage,
                owner: 'player', ownerTeam: player.team, ownerEntity: player,
                color: '#00ffaa',
                range: brawler.superRange * 60,
                distance: 0, isSuper: true
            });
        }
        spawnParticles(player.x, player.y, '#00FFAA', 18);
    } else if (brawler.id === 'archer') {
        // Archer - Arrow Rain: 8 arrows in wide arc
        for (let i = 0; i < 8; i++) {
            const a = player.angle + (i - 3.5) * 0.24;
            gameState.bullets.push({
                x: player.x + Math.cos(player.angle) * 45,
                y: player.y + Math.sin(player.angle) * 45,
                vx: Math.cos(a) * 22, vy: Math.sin(a) * 22,
                damage: brawler.superDamage,
                owner: 'player', ownerTeam: player.team, ownerEntity: player,
                color: '#66dd44',
                range: brawler.superRange * 60,
                distance: 0, isSuper: true
            });
        }
        spawnParticles(player.x, player.y, '#228B22', 15);
    }
}

/**
 * Apply damage to an entity
 * @param {Object} entity - The target entity
 * @param {number} damage - Amount of damage
 * @param {Object} attacker - The entity that caused the damage
 * @returns {boolean} - True if entity died
 */
export function damageEntity(entity, damage, attacker) {
    if (entity.invulnerable > 0) return false;
    
    // Reveal when taking damage
    entity.revealedTimer = 1500;
    
    // Hit flash and combat timer
    entity.flashTimer = 150;
    entity.lastDamageTime = Date.now();
    if (attacker) attacker.lastDamageTime = Date.now();
    
    entity.hp -= damage;
    entity.invulnerable = 400; // 400ms invulnerability
    
    if (attacker && attacker.team === 'player' && entity.team !== 'player') {
        attacker.superCharge = Math.min(100, (attacker.superCharge || 0) + (damage * 0.05)); // 5% charge per 100 dmg
    }
    
    if (entity.hp <= 0) {
        gameState.hitStop = 40; // 40ms freeze on kills
        spawnExplosion(entity.x, entity.y, entity.brawler.color);
        if (entity.team === 'player') {
            triggerShake(30);
        } else {
            triggerShake(15);
        }
        if (attacker) {
            attacker.kills = (attacker.kills || 0) + 1;
        }
    } else if (damage >= 800) {
        gameState.hitStop = 20; // 20ms freeze on heavy hits
    }
    
    return entity.hp <= 0;
}

/**
 * Update all bullets
 * @param {number} dt - Delta time
 */
export function updateBullets(dt) {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const b = gameState.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.distance += Math.hypot(b.vx, b.vy);
        
        // For throwers, calculate "altitude" or scale for visual arc
        if (b.isThrower) {
            const progress = b.distance / b.range;
            b.z = Math.sin(progress * Math.PI) * 50; // Visual height
        }
        
        // Remove if out of range or hit wall (unless it's a thrower still in flight)
        if (b.distance >= b.range) {
            if (b.isThrower) {
                // Explode at destination
                explodeBullet(b);
            }
            gameState.bullets.splice(i, 1);
            continue;
        }
    }
}

function explodeBullet(b) {
    // AOE Damage
    const entities = [gameState.player, ...gameState.enemies];
    entities.forEach(entity => {
        if (!entity || entity.hp <= 0) return;
        if (entity.team === b.ownerTeam) return; // Friendly fire off
        
        const dist = Math.hypot(entity.x - b.x, entity.y - b.y);
        if (dist < b.aoeRadius) {
            damageEntity(entity, b.damage, b.ownerEntity);
        }
    });
    
    // Heist safes
    if (gameState.gameMode === 'heist') {
        const enemySafe = b.ownerTeam === 'blue' ? gameState.enemySafe : gameState.safe;
        const distSafe = Math.hypot(enemySafe.x - b.x, enemySafe.y - b.y);
        if (distSafe < b.aoeRadius + CONFIG.SAFE_RADIUS) {
            enemySafe.hp -= b.damage;
        }
    }
    
    // Wall & Bush destruction
    if (b.breaksWalls) {
        destroyWallsInRadius(b.x, b.y, b.aoeRadius || 120);
        destroyBushesInRadius(b.x, b.y, b.aoeRadius || 120);
    }
}

function destroyWallsInRadius(x, y, radius) {
    for (let i = gameState.walls.length - 1; i >= 0; i--) {
        const wall = gameState.walls[i];
        const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
        const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
        const dx = x - closestX;
        const dy = y - closestY;
        
        if (dx * dx + dy * dy < radius * radius) {
            spawnParticles(wall.x + wall.w/2, wall.y + wall.h/2, '#888', 12);
            gameState.walls.splice(i, 1);
            triggerShake(10);
        }
    }
}

function destroyBushesInRadius(x, y, radius) {
    for (let i = gameState.bushes.length - 1; i >= 0; i--) {
        const bush = gameState.bushes[i];
        // Bushes are typically square tiles in config, usually 100x100
        const bw = bush.w || 100;
        const bh = bush.h || 100;
        const closestX = Math.max(bush.x, Math.min(x, bush.x + bw));
        const closestY = Math.max(bush.y, Math.min(y, bush.y + bh));
        const dx = x - closestX;
        const dy = y - closestY;
        
        if (dx * dx + dy * dy < radius * radius) {
            // Leafy destruction particles
            spawnParticles(bush.x + bw/2, bush.y + bh/2, '#2e7d32', 15, 'leaf');
            spawnParticles(bush.x + bw/2, bush.y + bh/2, '#1b5e20', 8, 'square');
            gameState.bushes.splice(i, 1);
            triggerShake(6);
        }
    }
}

/**
 * Check bullet collisions with entities
 * @returns {Object} - Hit information for effects
 */
export function checkBulletHits() {
    const hits = [];
    const player = gameState.player;
    const deadEnemyIndices = new Set();
    
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const b = gameState.bullets[i];
        
        // Throwers ignore everything until they land (handled in updateBullets)
        if (b.isThrower) continue;
        
        // Check wall collision
        if (checkWallCollision(b.x, b.y, CONFIG.BULLET_RADIUS)) {
            if (b.breaksWalls) {
                const r = b.radius * 2 || 80;
                destroyWallsInRadius(b.x, b.y, r);
                destroyBushesInRadius(b.x, b.y, r);
            }
            gameState.bullets.splice(i, 1);
            continue;
        }
        
        // Heist mode - check safe hits
        if (gameState.gameMode === 'heist') {
            const isFriendlyTeam = (b.ownerTeam === 'blue' || b.ownerTeam === 'player');
            const targetSafe = isFriendlyTeam ? gameState.enemySafe : gameState.safe;
            const distSafe = Math.hypot(b.x - targetSafe.x, b.y - targetSafe.y);
            if (distSafe < CONFIG.SAFE_RADIUS) {
                targetSafe.hp -= b.damage;
                gameState.bullets.splice(i, 1);
                hits.push({ type: 'safe', target: isFriendlyTeam ? 'enemy' : 'player', damage: b.damage });
                continue;
            }
        }
        
        // Check entity hits
        const allEntities = [gameState.player, ...gameState.enemies];
        let bulletHit = false;

        for (let j = 0; j < allEntities.length; j++) {
            const entity = allEntities[j];
            if (!entity || entity.hp <= 0) continue;
            
            const dist = Math.hypot(b.x - entity.x, b.y - entity.y);
            if (dist < entity.radius + CONFIG.BULLET_RADIUS) {
                if (b.isHealer && entity.team === b.ownerTeam) {
                    // Heal ally
                    entity.hp = Math.min(entity.maxHp, entity.hp + b.healAmount);
                    bulletHit = true;
                } else if (entity.team !== b.ownerTeam) {
                    // Damage enemy
                    const died = damageEntity(entity, b.damage, b.ownerEntity);
                    
                    // If player team shot it, charge player super
                    if (b.ownerTeam === player?.team) {
                        player.superCharge = Math.min(100, player.superCharge + 8);
                    }
                    
                    if (j === 0) { // Player
                        hits.push({ type: 'player', died: died, damage: b.damage });
                    } else {
                        // Apply knockback for Ironclad super or standard impact
                        const kb = b.superKnockback || 3;
                        entity.x += (b.vx / Math.hypot(b.vx, b.vy)) * kb;
                        entity.y += (b.vy / Math.hypot(b.vx, b.vy)) * kb;

                        spawnParticles(b.x, b.y, b.color, 5, b.particleType);
                        hits.push({ type: 'enemy', target: entity, died: died, damage: b.damage });
                        if (died) deadEnemyIndices.add(j - 1);
                    }
                    
                    if (!b.pierce) bulletHit = true;
                }
                
                if (bulletHit) break;
            }
        }

        if (bulletHit) {
            gameState.bullets.splice(i, 1);
        }
    }
    
    // Remove dead enemies
    const sortedDead = Array.from(deadEnemyIndices).sort((a, b) => b - a);
    for (const idx of sortedDead) {
        if (gameState.enemies[idx]) handleEnemyDeath(gameState.enemies[idx], idx);
    }
    
    return hits;
}

/**
 * Handle enemy death
 * @param {Object} enemy - The dead enemy
 * @param {number} index - Index in enemies array
 */
function handleEnemyDeath(enemy, index) {
    // Drop gems in Gem Grab
    if (enemy.gems > 0 && gameState.gameMode === 'gemGrab') {
        for (let g = 0; g < enemy.gems; g++) {
            gameState.gems.push({
                x: enemy.x + (Math.random() - 0.5) * 60,
                y: enemy.y + (Math.random() - 0.5) * 60,
                radius: CONFIG.GEM_RADIUS,
                collected: false
            });
        }
        enemy.gems = 0;
    }
    
    if (gameState.gameMode === 'showdown') {
        gameState.powerCubes.push({
            x: enemy.x,
            y: enemy.y,
            radius: 18,
            collected: false
        });
        gameState.enemies.splice(index, 1);
        gameState.playersLeft--;
    } else {
        // Respawn logic
        enemy.respawning = 3000;
        enemy.x = -1000;
        enemy.y = -1000;
    }
}

/**
 * Check if point collides with any wall (and optionally water)
 * @param {number} x - X position
 * @param {number} y - Y position  
 * @param {number} r - Radius
 * @param {boolean} includeWater - Whether to also check water tiles
 * @returns {boolean}
 */
export function checkWallCollision(x, y, r, includeWater = false) {
    const targets = includeWater ? [...gameState.walls, ...gameState.waterTiles] : gameState.walls;
    for (const wall of targets) {
        const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
        const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
        const dx = x - closestX;
        const dy = y - closestY;
        if (dx * dx + dy * dy < r * r) return true;
    }
    return false;
}

/**
 * Collect gems near an entity
 * @param {Object} entity - Player or enemy
 * @returns {number} - Gems collected
 */
export function collectGems(entity) {
    let collected = 0;
    
    for (let i = gameState.gems.length - 1; i >= 0; i--) {
        const gem = gameState.gems[i];
        if (!gem.collected && Math.hypot(entity.x - gem.x, entity.y - gem.y) < entity.radius + gem.radius) {
            if (entity.gems < CONFIG.MAX_GEMS) {
                entity.gems++;
                gem.collected = true;
                gameState.gems.splice(i, 1);
                collected++;
            }
        }
    }
    return collected;
}

/**
 * Collect power cubes near an entity
 * @param {Object} entity - Player or enemy
 */
export function collectPowerCubes(entity) {
    for (let i = gameState.powerCubes.length - 1; i >= 0; i--) {
        const cube = gameState.powerCubes[i];
        if (!cube.collected && Math.hypot(entity.x - cube.x, entity.y - cube.y) < entity.radius + cube.radius) {
            entity.powerCubes = (entity.powerCubes || 0) + 1;
            entity.maxHp += 400;
            entity.hp += 400;
            
            // Recompute damage
            entity.brawler = { ...entity.brawler };
            entity.brawler.damage = Math.floor(entity.brawler.damage * 1.1);
            
            cube.collected = true;
            gameState.powerCubes.splice(i, 1);
            
            spawnPickupText(entity.x, entity.y - entity.radius - 10, '+1 POWER CUBE', '#ccff00');
            spawnParticles(entity.x, entity.y, '#ccff00', 10);
        }
    }
}
