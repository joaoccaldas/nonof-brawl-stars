/**
 * effects.js - Visual effects and transient game objects
 */

import { gameState } from './state.js';

export function spawnParticles(x, y, color, count = 6, type = 'square') {
    for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 4.5;
        gameState.particles.push({ 
            x, y, 
            vx: Math.cos(a) * s, 
            vy: Math.sin(a) * s, 
            color, 
            type, // 'square', 'star', 'note', 'hex', 'leaf'
            life: 1.0, 
            r: 3 + Math.random() * 4,
            rotation: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.2
        });
    }
}

export function spawnExplosion(x, y, color, radius = 50) {
    spawnParticles(x, y, color, 15, 'star');
    spawnParticles(x, y, '#ffffff', 5, 'square');
    triggerShake(5);
}

export function spawnDmgNumber(x, y, amount, color = '#ff6b35') {
    gameState.floatingTexts.push({ x, y: y - 10, text: `-${amount}`, color, life: 1.0, vy: -1.2 });
}

export function spawnPickupText(x, y, text, color) {
    gameState.floatingTexts.push({ x, y: y - 10, text, color, life: 1.0, vy: -1.4 });
}

export function spawnDeathRing(x, y, color) {
    gameState.deathRings.push({ x, y, color, radius: 28, alpha: 1.0, timer: 520 });
    spawnParticles(x, y, color, 20);
}

export function spawnZone(x, y, radius, type, team, duration) {
    gameState.zones.push({ x, y, radius, type, team, duration, timer: duration });
}

export function triggerShake(intensity) {
    gameState.shakeAmount = Math.max(gameState.shakeAmount || 0, intensity);
}
