/**
 * render.js — p5.js rendering for Noah's Brawl Stars
 *
 * initRenderer(p5Instance, images) must be called once from main.js setup().
 * All draw functions use the stored p5 instance.
 */

import { gameState } from './state.js';
import { CONFIG, BIOMES } from './config.js';

let p   = null;
let IMG = {};

export function initRenderer(p5Instance, images) {
    p   = p5Instance;
    IMG = images || {};
}

export function getCanvasSize() {
    return { width: p ? p.width : 0, height: p ? p.height : 0 };
}

// ── Camera ────────────────────────────────────────────────────────────────────

export function updateCamera() {
    const player = gameState.player;
    if (!player) return;
    
    // 1. Dynamic Zoom Logic
    let minEnemyDist = 2000;
    gameState.enemies.forEach(e => {
        if (e.hp > 0) {
            const d = Math.hypot(e.x - player.x, e.y - player.y);
            if (d < minEnemyDist) minEnemyDist = d;
        }
    });

    // Zoom in when enemies are close, zoom out when exploring
    // Range: 1.1 (close combat) to 0.9 (wide view)
    const baseZoom = 1.0;
    if (minEnemyDist < 400) {
        gameState.camera.targetZoom = 1.15; // Intense close combat
    } else if (minEnemyDist < 800) {
        gameState.camera.targetZoom = 1.0;  // Normal view
    } else {
        gameState.camera.targetZoom = 0.9;  // Wide view for scouting
    }

    // Lerp zoom
    gameState.camera.zoom += (gameState.camera.targetZoom - gameState.camera.zoom) * 0.05;

    // 2. Smooth camera follow
    const tx = player.x;
    const ty = player.y;
    
    gameState.camera.x += (tx - gameState.camera.x) * 0.085;
    gameState.camera.y += (ty - gameState.camera.y) * 0.085;
}

export function clear() {
    p.background(10, 10, 22);
}

export function beginCamera() {
    p.push();
    // Center of screen
    p.translate(p.width / 2, p.height / 2);
    // Apply zoom
    p.scale(gameState.camera.zoom);
    // Translate to camera position (which is centered on player)
    p.translate(-gameState.camera.x, -gameState.camera.y);
}

export function endCamera() {
    p.pop();
}

// ── World ─────────────────────────────────────────────────────────────────────

export function drawWorld() {
    const dc  = p.drawingContext;
    const WW  = CONFIG.WORLD_WIDTH;
    const WH  = CONFIG.WORLD_HEIGHT;

    // Get current biome assets
    const biome = BIOMES[gameState.biome] || BIOMES.grassland;
    const floorImg = IMG[`${biome.id}_floor`] || IMG.floor;
    const wallImg  = IMG[`${biome.id}_wall`]  || IMG.wall;
    const bushImg  = IMG[`${biome.id}_bush`]  || IMG.bush;

    // Floor tiles or checkerboard fallback
    p.noStroke();
    if (floorImg && floorImg.width > 0) {
        p.imageMode(p.CORNER);
        for (let x = 0; x < WW; x += 128) {
            for (let y = 0; y < WH; y += 128) {
                p.image(floorImg, x, y, 128, 128);
            }
        }
    } else {
        for (let col = 0; col < WW / 100; col++) {
            for (let row = 0; row < WH / 100; row++) {
                p.fill((col + row) % 2 === 0 ? [22, 22, 52] : [28, 28, 62]);
                p.rect(col * 100, row * 100, 100, 100);
            }
        }
    }

    // Subtle grid overlay
    p.strokeWeight(1);
    p.stroke(0, 180, 255, 12);
    p.noFill();
    for (let x = 0; x <= WW; x += 100) p.line(x, 0, x, WH);
    for (let y = 0; y <= WH; y += 100) p.line(0, y, WW, y);

    // Showdown gas ring
    if (gameState.gameMode === 'showdown' && gameState.gasRadius) {
        dc.save();
        const gx = WW / 2, gy = WH / 2;
        dc.globalAlpha = 0.18;
        dc.fillStyle   = '#8b2be2';
        dc.beginPath(); dc.arc(gx, gy, gameState.gasRadius + 260, 0, Math.PI * 2); dc.fill();
        dc.globalAlpha = 0.65;
        dc.strokeStyle = '#cc44ff';
        dc.lineWidth   = 7;
        dc.shadowColor = '#cc44ff';
        dc.shadowBlur  = 20;
        dc.beginPath(); dc.arc(gx, gy, gameState.gasRadius, 0, Math.PI * 2); dc.stroke();
        dc.shadowBlur  = 0;
        dc.restore();
    }

    // Water tiles (Item #12) — High-fidelity procedural rendering
    if (gameState.waterTiles && gameState.waterTiles.length) {
        const waterT = p.frameCount / 60;
        gameState.waterTiles.forEach(w => {
            dc.save();
            // 1. Base — Deep Teal Gradient for depth
            const grad = dc.createRadialGradient(w.x + w.w/2, w.y + w.h/2, 0, w.x + w.w/2, w.y + w.h/2, w.w);
            grad.addColorStop(0, '#005a92'); // Deep center
            grad.addColorStop(1, '#007eb3'); // Lighter edge
            dc.fillStyle = grad;
            p.noStroke();
            p.rect(w.x + 2, w.y + 2, w.w - 4, w.h - 4, 8);

            // 2. Dynamic Ripples — layer 1 (concentric expanding rings)
            dc.globalAlpha = 0.3;
            p.stroke(130, 220, 255, 100);
            p.strokeWeight(2);
            p.noFill();
            for (let i = 0; i < 2; i++) {
                const shift = (waterT * 1.5 + i * 0.5) % 1.0;
                const r = 10 + shift * (w.w - 20);
                p.ellipse(w.x + w.w/2, w.y + w.h/2, r, r * 0.6);
            }

            // 3. Shimmer Surface — layer 2 (diagonal sine waves)
            dc.globalAlpha = 0.4 * (0.6 + 0.4 * Math.sin(waterT * 2));
            dc.fillStyle = '#b0f0ff';
            const waveX = w.x + 5 + ((waterT * 40 + w.y * 0.5) % (w.w - 20));
            dc.fillRect(waveX, w.y + 5, 8, w.h - 10);
            
            // 4. Foam Edge highlight
            p.stroke(255, 255, 255, 45);
            p.strokeWeight(1.5);
            p.noFill();
            p.rect(w.x + 3, w.y + 3, w.w - 6, w.h - 6, 8);
            
            dc.restore();
        });
    }


    // Jump Pads (Item #12)
    if (gameState.jumpPads && gameState.jumpPads.length) {
        const jumpT = p.frameCount / 60;
        gameState.jumpPads.forEach(pad => {
            p.push();
            p.translate(pad.x + pad.w/2, pad.y + pad.h/2);
            
            // Base plate
            p.noStroke();
            p.fill(60, 60, 80);
            p.rect(-45, -45, 90, 90, 15);
            
            // Golden center
            const pulse = 0.8 + 0.2 * Math.sin(jumpT * 5);
            p.fill(255, 215, 0, 180 * pulse);
            p.circle(0, 0, 65);
            
            // Arrows
            p.rotate(jumpT * 2);
            p.stroke(255, 255, 255, 200);
            p.strokeWeight(4);
            for(let i=0; i<4; i++) {
                p.rotate(Math.PI/2);
                p.line(0, -10, 0, -25);
                p.line(-8, -18, 0, -25);
                p.line(8, -18, 0, -25);
            }
            p.pop();
        });
    }

    // Walls — use dedicated wall tile, fall back to colored rect
    gameState.walls.forEach(w => {
        if (wallImg && wallImg.width > 0) {
            p.imageMode(p.CORNER);
            p.image(wallImg, w.x, w.y, w.w, w.h);
        } else {
            // Drop shadow
            p.noStroke();
            p.fill(0, 0, 0, 80);
            p.rect(w.x + 5, w.y + w.h - 2, w.w, 8, 4);
            // Wall body — gradient-style two-tone
            p.fill(45, 25, 90);
            p.rect(w.x, w.y, w.w, w.h, 6);
            p.fill(70, 45, 120);
            p.rect(w.x + 4, w.y + 4, w.w - 8, w.h * 0.45, 4);
        }
    });

    // Bushes — use dedicated bush tile, fall back to procedural circle
    const wind = Math.sin(p.frameCount * 0.05) * 5;
    gameState.bushes.forEach(bush => {
        if (bushImg && bushImg.width > 0) {
            p.imageMode(p.CENTER);
            p.image(bushImg, bush.x + wind * 0.25, bush.y, bush.r * 2.2, bush.r * 2.2);
        } else {
            // Procedural fallback — nice clean circle
            dc.save();
            dc.globalAlpha = 0.9;
            p.noStroke();
            // Shadow
            p.fill(0, 0, 0, 60);
            p.circle(bush.x + 4, bush.y + 4, bush.r * 1.8);
            // Dark outer ring
            p.fill(15, 60, 15);
            p.circle(bush.x + wind * 0.5, bush.y, bush.r * 1.7);
            // Bright inner
            p.fill(35, 110, 35);
            p.circle(bush.x + wind * 0.5, bush.y - 4, bush.r * 1.3);
            // Highlight
            p.fill(65, 160, 65, 180);
            p.circle(bush.x + wind * 0.3, bush.y - 8, bush.r * 0.7);
            dc.restore();
        }
    });

    // Minimal decorative crates near walls (no environment spritesheet)
    _drawDecorations();
    // Heist safes
    if (gameState.gameMode === 'heist') {
        _drawSafe(gameState.safe,      '#00d4ff', 'OUR SAFE',   IMG.safe_blue);
        _drawSafe(gameState.enemySafe, '#ff3366', 'ENEMY SAFE', IMG.safe_red);
    }
}

function _drawDecorations() {
    gameState.walls.forEach(w => {
        const hash = (w.x * 31 + w.y) % 100;
        // Subtle top-edge highlight to give walls a 3D look
        p.noStroke();
        p.fill(255, 255, 255, 18);
        p.rect(w.x + 2, w.y + 2, w.w - 4, 10, 3);

        if (hash > 80) {
            // Near-wall barrel
            const bx = w.x + w.w + 18;
            const by = w.y + 18;
            p.noStroke();
            p.fill(0, 0, 0, 50);
            p.circle(bx + 2, by + 2, 30);
            p.fill(100, 65, 20);
            p.circle(bx, by, 28);
            p.fill(130, 85, 30);
            p.circle(bx, by - 4, 18);
        } else if (hash < 12) {
            // Supply crate
            const cx = w.x - 22;
            const cy = w.y + w.h - 22;
            p.noStroke();
            p.fill(0, 0, 0, 55);
            p.rect(cx - 2, cy - 1, 30, 30, 4);
            p.fill(150, 110, 60);
            p.rect(cx, cy, 26, 26, 3);
            p.stroke(100, 70, 30); p.strokeWeight(1.5);
            p.line(cx + 3, cy + 3, cx + 23, cy + 23);
            p.line(cx + 23, cy + 3, cx + 3, cy + 23);
            p.noStroke();
        }
    });
}

function _drawSafe(safe, color, label, img) {
    const r   = CONFIG.SAFE_RADIUS;
    const pct = Math.max(0, safe.hp / safe.maxHp);
    const dc  = p.drawingContext;
    const now = Date.now();

    p.push();

    // ── Visual Damage States (Item #15) ──
    // ≤ 10% HP: Red emergency flash
    let glowIntensity = 22;
    if (pct <= 0.10) {
        const flash = Math.abs(Math.sin(now * 0.012));
        dc.shadowColor = '#ff0000';
        dc.shadowBlur  = 40 + flash * 30;
        color = '#ff0000';
        glowIntensity = 50;
    } else if (pct <= 0.25) {
        // ≤ 25%: Sparking — orange glow
        dc.shadowColor = '#ff6600';
        dc.shadowBlur  = 32;
        color = '#ff6600';
        glowIntensity = 32;
    } else if (pct <= 0.50) {
        // ≤ 50%: Smoking — yellow warning
        dc.shadowColor = '#ffcc00';
        dc.shadowBlur  = 24;
        color = '#ffcc00';
        glowIntensity = 24;
    } else {
        dc.shadowColor = color;
        dc.shadowBlur  = glowIntensity;
    }

    if (img && img.width > 0) {
        p.imageMode(p.CENTER);
        p.image(img, safe.x, safe.y, r * 3.2, r * 3.2);
    } else {
        p.noStroke();
        p.fill(color + '33');
        p.circle(safe.x, safe.y, r * 2);
        p.noFill();
        p.stroke(color);
        p.strokeWeight(4);
        p.circle(safe.x, safe.y, r * 2);
    }

    // Smoke particles for damaged safes
    if (pct <= 0.5 && Math.random() < 0.15) {
        const smokeColor = pct <= 0.25 ? '#ff8800' : '#aaaaaa';
        // Draw a tiny drifting smoke puff
        dc.globalAlpha = 0.5 * Math.random();
        p.noStroke();
        p.fill(smokeColor);
        const ox = (Math.random() - 0.5) * r;
        p.circle(safe.x + ox, safe.y - r * 0.8 - Math.random() * 20, 8 + Math.random() * 10);
        dc.globalAlpha = 1;
    }

    dc.shadowBlur = 0;

    // HP bar
    const bw = 130;
    p.noStroke();
    p.fill(0, 0, 0, 190);
    p.rect(safe.x - bw / 2, safe.y + r + 10, bw, 14, 7);
    const barColor = pct > 0.5 ? '#00ff88' : pct > 0.25 ? '#ffd700' : '#ff3366';
    p.fill(barColor);
    p.rect(safe.x - bw / 2, safe.y + r + 10, Math.max(bw * pct, 0), 14, 7);
    // Bar label
    p.fill(255); p.textAlign(p.CENTER, p.CENTER); p.textFont('Bangers'); p.textSize(11);
    p.text(Math.round(pct * 100) + '%', safe.x, safe.y + r + 17);

    p.fill(255);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont('Bangers');
    p.textSize(15);
    p.text(label, safe.x, safe.y + 4);
    p.pop();
}

// ── Showdown Gas Vignette (Item #17) ──
export function drawGasVignette(player) {
    if (!player || gameState.gameMode !== 'showdown') return;
    const cx = CONFIG.WORLD_WIDTH  / 2;
    const cy = CONFIG.WORLD_HEIGHT / 2;
    const dist = Math.hypot(player.x - cx, player.y - cy);
    if (dist < gameState.gasRadius - 80) return; // safely inside — no vignette

    const dc = p.drawingContext;
    const depth = Math.min(1.0, (dist - (gameState.gasRadius - 80)) / 200);
    dc.save();
    const grad = dc.createRadialGradient(
        p.width / 2, p.height / 2, p.height * 0.3,
        p.width / 2, p.height / 2, p.height * 0.8
    );
    grad.addColorStop(0, `rgba(140,0,220,0)`);
    grad.addColorStop(1, `rgba(140,0,220,${(depth * 0.72).toFixed(2)})`);
    dc.fillStyle = grad;
    dc.fillRect(0, 0, p.width, p.height);

    // Pulsing warning text
    if (depth > 0.3) {
        const warnAlpha = 0.6 + 0.4 * Math.abs(Math.sin(Date.now() * 0.005));
        dc.globalAlpha = warnAlpha;
        dc.font = 'bold 22px Bangers';
        dc.fillStyle = '#ff88ff';
        dc.textAlign = 'center';
        dc.fillText('⚠ GAS ZONE', p.width / 2, 52);
        dc.globalAlpha = 1;
    }
    dc.restore();
}

// ── Gem Mine Centerpiece (Item #16) ───────────────────────────────────────────

export function drawGemMine(rumble = 0) {
    const cx  = CONFIG.WORLD_WIDTH  / 2;
    const cy  = CONFIG.WORLD_HEIGHT / 2;
    const dc  = p.drawingContext;
    const t   = p.frameCount / 60;

    // Rumble offset — mine shakes before ejecting
    const shake = rumble > 0.3 ? Math.sin(t * 40) * rumble * 7 : 0;
    const mx = cx + shake;
    const my = cy + shake * 0.5;

    p.push();

    // ── Outer glow ring ──
    dc.save();
    const glowPulse = 0.5 + 0.5 * Math.sin(t * 2.5);
    const glowR = 80 + glowPulse * 14 + rumble * 22;
    const grad = dc.createRadialGradient(mx, my, 0, mx, my, glowR);
    grad.addColorStop(0,   `rgba(0,220,255,${0.28 + rumble * 0.35})`);
    grad.addColorStop(0.5, `rgba(0,150,220,${0.12 + rumble * 0.15})`);
    grad.addColorStop(1,   'rgba(0,80,180,0)');
    dc.fillStyle = grad;
    dc.beginPath();
    dc.arc(mx, my, glowR, 0, Math.PI * 2);
    dc.fill();
    dc.restore();

    // ── Rotating outer ring of crystals ──
    const numCrystals = 8;
    for (let i = 0; i < numCrystals; i++) {
        const a = (Math.PI * 2 / numCrystals) * i + t * 0.6;
        const cr = 58 + rumble * 10;
        const cx2 = mx + Math.cos(a) * cr;
        const cy2 = my + Math.sin(a) * cr;
        const cSize = 6 + 3 * Math.sin(t * 3 + i) + rumble * 4;
        dc.save();
        dc.shadowColor = '#00e5ff';
        dc.shadowBlur  = 10 + rumble * 15;
        p.fill(0, 200, 255, 200 + rumble * 55);
        p.noStroke();
        // Diamond crystal shape
        p.push();
        p.translate(cx2, cy2);
        p.rotate(a + t);
        p.beginShape();
        p.vertex(0, -cSize);
        p.vertex(cSize * 0.5, 0);
        p.vertex(0, cSize);
        p.vertex(-cSize * 0.5, 0);
        p.endShape(p.CLOSE);
        p.pop();
        dc.restore();
    }

    // ── Inner hole (dark pit) ──
    dc.save();
    const pitGrad = dc.createRadialGradient(mx, my, 5, mx, my, 42);
    pitGrad.addColorStop(0,   '#000010');
    pitGrad.addColorStop(0.6, '#001030');
    pitGrad.addColorStop(1,   '#002060');
    dc.fillStyle = pitGrad;
    dc.beginPath();
    dc.arc(mx, my, 42, 0, Math.PI * 2);
    dc.fill();
    // Pit rim
    dc.shadowColor = '#00aaff';
    dc.shadowBlur  = 16 + rumble * 20;
    dc.strokeStyle = `rgba(0,180,255,${0.7 + rumble * 0.3})`;
    dc.lineWidth   = 3 + rumble * 2;
    dc.stroke();
    dc.restore();

    // ── Spinning inner rune ring ──
    dc.save();
    dc.globalAlpha = 0.45 + rumble * 0.4;
    p.noFill();
    p.stroke(0, 180, 255, 180);
    p.strokeWeight(1.5);
    for (let i = 0; i < 6; i++) {
        const a1 = (Math.PI * 2 / 6) * i - t * 1.2;
        const a2 = a1 + Math.PI / 6;
        const ri = 26;
        p.line(mx + Math.cos(a1) * ri, my + Math.sin(a1) * ri,
               mx + Math.cos(a2) * ri, my + Math.sin(a2) * ri);
    }
    dc.restore();

    // ── Central gem preview (when rumble is high) ──
    if (rumble > 0.5) {
        const gemAlpha = (rumble - 0.5) * 2;
        dc.save();
        dc.globalAlpha = gemAlpha * 0.9;
        dc.shadowColor = '#00e5ff';
        dc.shadowBlur  = 25 * gemAlpha;
        const gr = dc.createRadialGradient(mx, my - 8, 0, mx, my, 18);
        gr.addColorStop(0,   '#ffffff');
        gr.addColorStop(0.3, '#00d4ff');
        gr.addColorStop(1,   '#005588');
        dc.fillStyle = gr;
        dc.beginPath();
        dc.moveTo(mx,       my - 18 * gemAlpha);
        dc.lineTo(mx + 14,  my);
        dc.lineTo(mx,       my + 18 * gemAlpha);
        dc.lineTo(mx - 14,  my);
        dc.closePath();
        dc.fill();
        dc.restore();
    }

    // ── "GEM MINE" label ──
    dc.save();
    dc.globalAlpha = 0.6 + rumble * 0.35;
    p.noStroke();
    p.fill(0, 200, 255);
    p.textAlign(p.CENTER, p.BOTTOM);
    p.textFont('Bangers');
    p.textSize(14);
    p.text('GEM MINE', mx, my - 50);
    dc.restore();

    p.pop();
}

// ── Gems ──────────────────────────────────────────────────────────────────────

export function drawGems() {
    const dc = p.drawingContext;
    const t  = p.frameCount / 60;

    for (const gem of gameState.gems) {
        if (gem.collected) continue;
        const r = gem.radius;

        p.push();
        dc.shadowColor = '#00e5ff';
        dc.shadowBlur  = 28;

        // Gradient diamond fill
        const gg = dc.createRadialGradient(gem.x, gem.y - r * 0.3, 0, gem.x, gem.y, r * 1.2);
        gg.addColorStop(0,   '#ffffff');
        gg.addColorStop(0.3, '#00d4ff');
        gg.addColorStop(1,   '#005588');
        dc.fillStyle = gg;
        dc.beginPath();
        dc.moveTo(gem.x,          gem.y - r);
        dc.lineTo(gem.x + r * 0.78, gem.y);
        dc.lineTo(gem.x,          gem.y + r);
        dc.lineTo(gem.x - r * 0.78, gem.y);
        dc.closePath();
        dc.fill();

        // Inner highlight
        dc.fillStyle = 'rgba(255,255,255,0.5)';
        dc.beginPath();
        dc.moveTo(gem.x,           gem.y - r * 0.7);
        dc.lineTo(gem.x + r * 0.38, gem.y - r * 0.1);
        dc.lineTo(gem.x,           gem.y - r * 0.1);
        dc.closePath();
        dc.fill();

        dc.shadowBlur = 0;

        // Rotating sparkles
        p.fill(255, 255, 255, 210);
        p.noStroke();
        for (let i = 0; i < 4; i++) {
            const a  = t * 2.8 + gem.x * 0.01 + (Math.PI / 2) * i;
            p.circle(gem.x + Math.cos(a) * r * 0.6, gem.y + Math.sin(a) * r * 0.6, 4);
        }
        p.pop();
    }
}

// ── Bullets ───────────────────────────────────────────────────────────────────

export function drawBullets() {
    const dc = p.drawingContext;

    for (const b of gameState.bullets) {
        const bx = b.x;
        const by = b.y - (b.z || 0);

        p.push();

        // Ground shadow for throwers
        if (b.isThrower) {
            p.fill(0, 0, 0, 45);
            p.noStroke();
            p.ellipse(b.x, b.y, CONFIG.BULLET_RADIUS * 3.5, CONFIG.BULLET_RADIUS * 1.2);
        }

        // Fading trail
        const steps = b.isSuper ? 5 : 3;
        for (let i = steps; i >= 1; i--) {
            const frac   = i / steps;
            const tx     = bx - b.vx * i * 1.8;
            const ty     = by - b.vy * i * 1.8;
            const radius = (b.isSuper ? 9 : 5) * frac;
            dc.globalAlpha = frac * 0.35;
            dc.fillStyle   = b.color;
            dc.beginPath(); dc.arc(tx, ty, radius, 0, Math.PI * 2); dc.fill();
        }
        dc.globalAlpha = 1;

        // Glow
        dc.shadowColor = b.color;
        dc.shadowBlur  = b.isSuper ? 30 : 18;

        // White outer core
        p.noStroke();
        p.fill(255, 255, 255);
        p.circle(bx, by, (b.isSuper ? 18 : 11) * 2);

        // Colored inner
        p.fill(b.color);
        p.circle(bx, by, (b.isSuper ? 11 : 6) * 2);

        dc.shadowBlur = 0;
        p.pop();
    }
}

// ── Particles ─────────────────────────────────────────────────────────────────

export function drawParticleEffects() {
    const dc = p.drawingContext;
    p.push();
    p.noStroke();
    for (const pt of gameState.particles) {
        dc.globalAlpha = Math.max(0, pt.life * 0.9);
        dc.shadowColor = pt.color;
        dc.shadowBlur  = pt.type === 'square' ? 10 : 20;
        p.fill(pt.color);
        
        p.push();
        p.translate(pt.x, pt.y);
        p.rotate(pt.rotation || 0);
        const size = Math.max(1, pt.r * pt.life * 2);

        switch(pt.type) {
            case 'star':
                _drawStar(0, 0, size * 0.5, size, 5);
                break;
            case 'note':
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(size * 1.5);
                p.text('♪', 0, 0);
                break;
            case 'hex':
                _drawPolygon(0, 0, size, 6);
                break;
            case 'leaf':
                p.beginShape();
                p.vertex(0, -size * 0.5);
                p.bezierVertex(size * 0.5, -size * 0.2, size * 0.5, size * 0.2, 0, size * 0.5);
                p.bezierVertex(-size * 0.5, size * 0.2, -size * 0.5, -size * 0.2, 0, -size * 0.5);
                p.endShape(p.CLOSE);
                break;
            default: // square / circle
                p.rectMode(p.CENTER);
                p.rect(0, 0, size, size, 2);
        }
        p.pop();
    }
    dc.globalAlpha = 1;
    dc.shadowBlur  = 0;
    p.pop();
}

function _drawStar(x, y, radius1, radius2, npoints) {
    let angle = p.TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    p.beginShape();
    for (let a = 0; a < p.TWO_PI; a += angle) {
        let sx = x + p.cos(a) * radius2;
        let sy = y + p.sin(a) * radius2;
        p.vertex(sx, sy);
        sx = x + p.cos(a + halfAngle) * radius1;
        sy = y + p.sin(a + halfAngle) * radius1;
        p.vertex(sx, sy);
    }
    p.endShape(p.CLOSE);
}

function _drawPolygon(x, y, radius, npoints) {
    let angle = p.TWO_PI / npoints;
    p.beginShape();
    for (let a = 0; a < p.TWO_PI; a += angle) {
        let sx = x + p.cos(a) * radius;
        let sy = y + p.sin(a) * radius;
        p.vertex(sx, sy);
    }
    p.endShape(p.CLOSE);
}

// ── Zones (Supers/AOE) ────────────────────────────────────────────────────────

export function drawZone(z) {
    const dc    = p.drawingContext;
    const pulse = 0.18 + Math.sin(p.frameCount / 22) * 0.05;

    p.push();
    dc.globalAlpha = pulse;
    p.noStroke();
    p.fill(z.type === 'healing' ? '#00ff88' : '#ff4400');
    p.circle(z.x, z.y, z.radius * 2);

    dc.globalAlpha = 0.55;
    p.noFill();
    p.stroke(z.type === 'healing' ? '#ffffff' : '#ffd700');
    p.strokeWeight(3);
    dc.setLineDash([10, 5]);
    dc.lineDashOffset = -(p.frameCount * 0.5);
    p.circle(z.x, z.y, z.radius * 2);
    dc.setLineDash([]);
    dc.globalAlpha = 1;
    p.pop();
}

// ── Floating Damage Numbers ───────────────────────────────────────────────────

export function drawFloatingText(ft) {
    p.push();
    p.drawingContext.globalAlpha = Math.max(0, ft.life);
    const sz = Math.round(18 + (1 - ft.life) * 10);
    p.textFont('Bangers');
    p.textSize(sz);
    p.textAlign(p.CENTER, p.CENTER);
    // Outline
    p.fill(0, 0, 0, 200);
    p.noStroke();
    for (const [ox, oy] of [[-2,0],[2,0],[0,-2],[0,2]]) {
        p.text(ft.text, ft.x + ox, ft.y + oy);
    }
    p.fill(ft.color);
    p.text(ft.text, ft.x, ft.y);
    p.pop();
}

// ── Death Ring ────────────────────────────────────────────────────────────────

export function drawDeathRing(d) {
    const dc = p.drawingContext;
    p.push();
    dc.globalAlpha = Math.max(0, d.alpha * 0.75);
    dc.shadowColor = d.color;
    dc.shadowBlur  = 30;
    p.noFill();
    p.stroke(d.color);
    p.strokeWeight(6);
    p.circle(d.x, d.y, d.radius * 2);
    dc.shadowBlur  = 0;
    dc.globalAlpha = 1;
    p.pop();
}

// ── Brawler Drawing ───────────────────────────────────────────────────────────

export function drawBrawler(entity, isPlayer) {
    const { x, y, radius: r, angle, invulnerable, rageActive,
            gems, hp, maxHp, inBush, revealedTimer } = entity;

    // --- Animation logic ---
    const isMoving = isPlayer ? (Math.abs(window.brawlGame?.input?.moveX || 0) > 0.1 || Math.abs(window.brawlGame?.input?.moveY || 0) > 0.1) : true;
    const walkCycle = isMoving ? (p.frameCount * 0.22) : 0;
    const bob = isMoving ? Math.abs(Math.sin(walkCycle)) * 6 : 0;
    const squash = isMoving ? 1.0 + Math.sin(walkCycle) * 0.05 : 1.0;
    const stretch = isMoving ? 1.0 - Math.sin(walkCycle) * 0.05 : 1.0;

    // Stealth logic
    let alpha = 1.0;
    if (inBush) {
        if (isPlayer) {
            alpha = 0.5;
        } else {
            const player   = gameState.player;
            const dist2P   = player ? Math.hypot(x - player.x, y - player.y) : 9999;
            const revealed = (revealedTimer > 0) || (dist2P < 180);
            if (!revealed) return;
            alpha = 0.5;
        }
    }

    const dc = p.drawingContext;
    p.push();
    dc.globalAlpha = alpha;

    // Ground shadow (scales with bob)
    dc.shadowBlur = 0;
    p.fill(0, 0, 0, 65);
    p.noStroke();
    const shadowScale = 1.0 - (bob / 20);
    p.ellipse(x, y + r * 0.78, r * 1.7 * shadowScale, r * 0.52 * shadowScale);

    // Invulnerability flash
    if (invulnerable > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
        dc.globalAlpha = alpha * 0.3;
    }

    // Rage outer glow
    if (rageActive) {
        dc.shadowColor = '#ff4400';
        dc.shadowBlur  = 35;
        p.noFill();
        p.stroke('#ff440088');
        p.strokeWeight(8);
        p.circle(x, y, (r + 10) * 2);
        dc.shadowBlur = 0;
    }

    // ── Super Charge Telegraphing Ring (Item #18) ──
    // Show a glowing pulsing ring under enemy when super is charged ≥ 100%
    if (!isPlayer && entity.superCharge >= 100) {
        const pulse = 0.5 + 0.5 * Math.abs(Math.sin(Date.now() * 0.006));
        dc.globalAlpha = alpha * (0.55 + 0.45 * pulse);
        dc.shadowColor = '#ffd700';
        dc.shadowBlur  = 28 * pulse;
        p.noFill();
        p.stroke('#ffd700');
        p.strokeWeight(4);
        p.circle(x, y, (r + 16) * 2);
        // Second outer ring for dramatic effect
        dc.globalAlpha = alpha * 0.25 * pulse;
        p.circle(x, y, (r + 28) * 2);
        dc.shadowBlur  = 0;
        dc.globalAlpha = alpha;
    } else if (!isPlayer && entity.superCharge >= 70) {
        // Partial charge — subtle warm hint
        dc.globalAlpha = alpha * 0.3;
        dc.shadowColor = '#ffaa00';
        dc.shadowBlur  = 10;
        p.noFill();
        p.stroke('#ffaa00');
        p.strokeWeight(2);
        p.circle(x, y, (r + 12) * 2);
        dc.shadowBlur  = 0;
        dc.globalAlpha = alpha;
    }

    // Team ring
    const ringColor = _teamColor(entity);
    dc.shadowColor = ringColor;
    dc.shadowBlur  = isPlayer ? 20 : 12;
    p.noFill();
    p.stroke(ringColor);
    p.strokeWeight(isPlayer ? 5 : 3.5);
    p.circle(x, y, (r + (isPlayer ? 6 : 3)) * 2);
    dc.shadowBlur = 0;

    // Sprite + Aim
    p.push();
    if (entity.flashTimer > 0) {
        dc.filter = 'brightness(3.5)';
    } else if (!isPlayer && revealedTimer > 1200) {
        dc.filter = 'brightness(2.2) saturate(1.8)';
    }
    
    // Apply Bob and Squash/Stretch
    p.translate(x, y - bob);
    p.scale(stretch, squash);
    
    p.push();
    if (Math.cos(angle) < 0) p.scale(-1, 1);
    _drawSprite(entity, r, rageActive);
    p.pop();

    dc.filter = 'none';

    // Aim arrow
    const arrColor = isPlayer ? '#ffd700' : 'rgba(255,255,255,0.85)';
    if (isPlayer) { dc.shadowColor = '#ffd700'; dc.shadowBlur = 10; }
    p.push();
    p.rotate(angle);
    p.fill(arrColor);
    p.noStroke();
    p.beginShape();
    p.vertex(r * 0.72, -r * 0.28);
    p.vertex(r * 1.42,  0);
    p.vertex(r * 0.72,  r * 0.28);
    p.endShape(p.CLOSE);
    p.pop();
    dc.shadowBlur = 0;
    p.pop();

    // Aim range line — Premium Tracer
    if (isPlayer) {
        const rangeLen = entity.brawler.range * 60;
        const pulse = Math.sin(p.frameCount * 0.15) * 0.15 + 0.85;
        
        p.push();
        dc.save();
        
        // The beam glow
        const g = dc.createLinearGradient(
            x + Math.cos(angle) * (r + 10), y + Math.sin(angle) * (r + 10),
            x + Math.cos(angle) * rangeLen,  y + Math.sin(angle) * rangeLen
        );
        g.addColorStop(0,   'rgba(255,255,255,0.4)');
        g.addColorStop(0.5, 'rgba(255,255,255,0.15)');
        g.addColorStop(1,   'rgba(255,255,255,0)');
        
        dc.strokeStyle = g;
        dc.lineWidth   = 6 * pulse;
        dc.beginPath();
        dc.moveTo(x + Math.cos(angle) * (r + 15), y + Math.sin(angle) * (r + 15));
        dc.lineTo(x + Math.cos(angle) * rangeLen,  y + Math.sin(angle) * rangeLen);
        dc.stroke();
        
        // Animated dash line
        dc.globalAlpha = 0.6;
        dc.strokeStyle = '#fff';
        dc.lineWidth   = 2;
        dc.setLineDash([12, 10]);
        dc.lineDashOffset = -(p.frameCount * 0.8);
        dc.stroke();
        
        // Target Reticle at end
        p.noFill();
        p.stroke(255, 255, 255, 150);
        p.strokeWeight(2);
        const ex = x + Math.cos(angle) * rangeLen;
        const ey = y + Math.sin(angle) * rangeLen;
        p.circle(ex, ey, 24 * pulse);
        p.line(ex - 8, ey, ex + 8, ey);
        p.line(ex, ey - 8, ex, ey + 8);
        
        dc.restore();
        p.pop();
    }

    // Brawler name tag (Now includes player and has screen-clamping)
    const tagY = y - r - 44;
    const margin = 50;
    // Calculate clamped position relative to camera
    const screenX = x - gameState.camera.x;
    const clampedScreenX = Math.max(margin, Math.min(p.width - margin, screenX));
    const drawX = clampedScreenX + gameState.camera.x; // Back to world space for the current transform

    p.fill(0, 0, 0, 155);
    p.noStroke();
    p.rect(drawX - 45, tagY - 12, 90, 18, 5);
    p.fill(isPlayer ? varColor(entity.brawler.color) : 255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont('Bangers');
    p.textSize(14);
    p.text(isPlayer ? 'NOAH' : (entity.brawler.name || ''), drawX, tagY - 4);

    function varColor(c) { return c || '#fff'; }

    // Gem badge
    if (gems > 0) {
        dc.shadowColor = '#00d4ff';
        dc.shadowBlur  = 10;
        p.fill('#00d4ff');
        p.noStroke();
        p.circle(x + r * 0.82, y - r * 0.82, 22);
        dc.shadowBlur = 0;
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textFont('Roboto');
        p.textSize(11);
        p.text(gems, x + r * 0.82, y - r * 0.82);
    }

    if (!isPlayer) {
        _drawHealthBar(x, y - r - 28, 70, 11, hp / maxHp, entity.team);
    }

    p.pop();
}

function _teamColor(entity) {
    if (entity.team === 'blue' || entity.team === 'player') return '#00d4ff';
    if (entity.team === 'red')                               return '#ff3366';
    return '#ffd700'; // showdown individual
}

function _drawHealthBar(cx, top, w, h, pct, team) {
    pct = Math.max(0, Math.min(1, pct));
    const hpColor = pct > 0.5 ? '#00ff88' : pct > 0.25 ? '#ffd700' : '#ff3366';
    p.noStroke();
    p.fill(0, 0, 0, 190);
    p.rect(cx - w / 2, top, w, h, h / 2);
    if (pct > 0) {
        p.fill(hpColor);
        p.rect(cx - w / 2, top, Math.max(w * pct, h), h, h / 2);
    }
    p.noFill();
    p.stroke(255, 255, 255, 50);
    p.strokeWeight(1.5);
    p.rect(cx - w / 2, top, w, h, h / 2);
}

// ── Sprite Dispatch ───────────────────────────────────────────────────────────

function _drawSprite(entity, r, rageActive) {
    const brawler = entity.brawler;
    const key     = (entity.skin && entity.skin !== 'default') ? `${brawler.id}_${entity.skin}` : brawler.id;
    const img     = IMG[key] || IMG[brawler.id];
    if (img && img.width > 0) {
        p.imageMode(p.CENTER);
        // Final scale tweak to 1.9 for perfect proportions
        p.image(img, 0, 0, r * 1.9, r * 1.9);
        return;
    }
    _drawProceduralSprite(brawler.id, r, rageActive);
}

function _drawProceduralSprite(id, r, rageActive) {
    switch (id) {
        case 'bear':       _drawBear(r, rageActive);   break;
        case 'caveman':    _drawCaveman(r, rageActive); break;
        case 'eagle':      _drawEagle(r);              break;
        case 'hex':        _drawHex(r);                break;
        case 'ironclad':   _drawIronclad(r);           break;
        case 'blade':      _drawBlade(r);              break;
        case 'archer':     _drawArcher(r);             break;
        case 'medic':      _drawMedic(r);              break;
        case 'bombardier': _drawBombardier(r);         break;
        default:
            p.fill(136); p.noStroke(); p.circle(0, 0, r * 2);
    }
}

export function drawDyingBrawler(de) {
    p.push();
    p.drawingContext.globalAlpha = Math.max(0, de.opacity);
    p.translate(de.x, de.y);
    p.rotate(de.spinAngle);
    p.scale(de.scale, de.scale);
    _drawProceduralSprite(de.brawlerId, de.radius, false);
    p.pop();
}

// ── Helper for Gradients ──
function _grd(x0, y0, r0, x1, y1, r1) {
    return p.drawingContext.createRadialGradient(x0, y0, r0, x1, y1, r1);
}
function _fillGrd(grd) {
    p.drawingContext.fillStyle = grd;
}
function _arcFill(cx, cy, r) {
    const dc = p.drawingContext;
    dc.beginPath(); dc.arc(cx, cy, r, 0, Math.PI * 2); dc.fill();
}

function _drawBodyShading(r, baseColor) {
    const dc = p.drawingContext;
    // Main Body
    p.fill(baseColor); p.noStroke();
    p.circle(0, 0, r * 2);
    
    // Side Shading (3D effect)
    const shade = dc.createRadialGradient(r*0.3, -r*0.3, 0, 0, 0, r);
    shade.addColorStop(0, 'rgba(255,255,255,0.2)');
    shade.addColorStop(0.5, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.3)');
    _fillGrd(shade); _arcFill(0, 0, r);
}

// ── NEW FUN SPRITES (Brawl Stars Style) ───────────────────────────────────────

// 🐻 SOLAR PAWS (Sun Bear) - Pro Gamer Bear
function _drawBear(r, rage) {
    const dc = p.drawingContext;
    // Glow Aura
    const aura = _grd(0, 0, r * 0.3, 0, 0, r * 1.7);
    aura.addColorStop(0, rage ? 'rgba(255,100,0,0.5)' : 'rgba(255,215,0,0.3)');
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    _fillGrd(aura); _arcFill(0, 0, r * 1.7);

    // Ears with Headset
    p.noStroke();
    p.fill('#6a350f');
    p.circle(-r * 0.7, -r * 0.7, r * 0.7);
    p.circle( r * 0.7, -r * 0.7, r * 0.7);
    p.fill('#8b4513');
    p.circle(-r * 0.7, -r * 0.7, r * 0.4);
    p.circle( r * 0.7, -r * 0.7, r * 0.4);
    
    // Headset Band
    p.stroke('#222'); p.strokeWeight(r*0.25); p.noFill();
    p.arc(0, -r*0.1, r*1.65, r*1.65, Math.PI + 0.4, Math.PI * 2 - 0.4);

    // Body
    _drawBodyShading(r, '#cd853f');

    // Gamer Visor
    p.fill('#111');
    p.rect(-r*0.7, -r*0.4, r*1.4, r*0.45, r*0.1);
    dc.shadowColor = '#00f2ff'; dc.shadowBlur = 15;
    p.fill('#00f2ff');
    p.rect(-r*0.6, -r*0.35, r*1.2, r*0.12, r*0.05);
    dc.shadowBlur = 0;

    // Expression - mouth
    p.stroke('#5d3011'); p.strokeWeight(2);
    p.line(-r*0.2, r*0.2, r*0.2, r*0.2);

    // Badge
    p.fill('#ffd700');
    p.circle(0, r*0.45, r*0.4);
    p.fill('#000');
    p.textAlign(p.CENTER, p.CENTER); p.textSize(r*0.3); p.text('⚡', 0, r*0.5);
}

// 🏋️ PUNK BONKER (Caveman) - Neon Punk
function _drawCaveman(r, rage) {
    const dc = p.drawingContext;
    _drawBodyShading(r, '#ffccaa');

    // HOT PINK MOHAWK
    p.fill('#ff00ff');
    for(let i=-2; i<=2; i++) {
        p.push();
        p.translate(i*r*0.3, -r*0.8);
        p.rotate(i*0.2);
        p.ellipse(0, 0, r*0.4, r*1.0);
        // Mohawk highlights
        p.fill(255, 100, 255, 150);
        p.ellipse(0, -r*0.2, r*0.2, r*0.4);
        p.pop();
    }

    // Neon Goggles
    p.fill('#222');
    p.rect(-r*0.7, -r*0.35, r*1.4, r*0.45, r*0.1);
    p.fill('#00ff00');
    p.circle(-r*0.3, -r*0.1, r*0.22); p.circle(r*0.3, -r*0.1, r*0.22);
    // Goggle highlight
    p.fill(255, 255, 255, 180);
    p.circle(-r*0.35, -r*0.15, 4);

    // Leopard Club - 3D shaded
    p.push();
    p.rotate(0.5);
    p.fill('#ccaa00');
    p.rect(r*0.8, -r*0.2, r*1.3, r*0.5, r*0.1);
    p.fill('#ffd700'); // top highlight
    p.rect(r*0.8, -r*0.2, r*1.3, r*0.15, r*0.1);
    // Leopard dots
    p.fill('#333');
    for(let i=0; i<5; i++) p.circle(r*(1.1 + i*0.22), 0, r*0.12);
    p.pop();
}

// 🦅 AVIATOR ACE (Eagle Eye) - Sky Pilot
function _drawEagle(r) {
    const dc = p.drawingContext;
    // Mechanical Wings — Shaded
    p.fill('#2266cc');
    p.ellipse(-r*1.15, 0, r*1.3, r*0.6);
    p.ellipse( r*1.15, 0, r*1.3, r*0.6);
    p.fill('#4488ff');
    p.ellipse(-r*1.15, -r*0.1, r*1.1, r*0.4);
    p.ellipse( r*1.15, -r*0.1, r*1.1, r*0.4);

    // Pilot Helmet
    _drawBodyShading(r, '#444');
    p.fill('#ddd');
    p.arc(0, 0, r*2, r*2, Math.PI, Math.PI*2);

    // Red Goggles
    p.fill('#222');
    p.rect(-r*0.8, -r*0.35, r*1.6, r*0.55, r*0.1);
    dc.shadowColor = '#ff3333'; dc.shadowBlur = 12;
    p.fill('#ff3333');
    p.rect(-r*0.65, -r*0.28, r*0.55, r*0.35);
    p.rect(r*0.1, -r*0.28, r*0.55, r*0.35);
    dc.shadowBlur = 0;

    // Beak
    p.fill('#ccaa00');
    p.triangle(r*0.5, -r*0.1, r*1.3, 0, r*0.5, r*0.1);
    p.fill('#ffcc00');
    p.triangle(r*0.5, -r*0.1, r*1.1, -r*0.05, r*0.5, 0);
}

// 🧙 SHADOW DJ (Hex)
function _drawHex(r) {
    const dc = p.drawingContext;
    p.fill('#2b0044'); p.noStroke();
    p.circle(0, 0, r * 2);

    // Purple Headphones
    p.fill('#9d4edd');
    p.circle(-r, 0, r*0.6); p.circle(r, 0, r*0.6);
    p.stroke('#9d4edd'); p.strokeWeight(r*0.15); p.noFill();
    p.arc(0, 0, r*2, r*2, Math.PI, Math.PI*2);

    // Neon Face
    p.noStroke();
    p.fill('#111');
    p.rect(-r*0.6, -r*0.2, r*1.2, r*0.7, r*0.1);
    dc.shadowColor = '#ff00ff'; dc.shadowBlur = 15;
    p.fill('#ff00ff');
    p.circle(-r*0.3, r*0.1, r*0.2); p.circle(r*0.3, r*0.1, r*0.2);
    dc.shadowBlur = 0;
}

// 🤖 MECHA-UNIT (Ironclad)
function _drawIronclad(r) {
    const dc = p.drawingContext;
    p.fill('#778899'); p.noStroke();
    p.rect(-r, -r, r*2, r*2, r*0.2);

    // Hazard Stripes
    p.fill('#ffd700');
    p.rect(-r, r*0.4, r*2, r*0.3);
    p.fill('#000');
    for(let i=0; i<4; i++) {
        p.push(); p.translate(-r + i*r*0.5, r*0.4); p.rotate(0.5); p.rect(0,0,r*0.1,r*0.5); p.pop();
    }

    // Cyclops Eye
    p.fill('#111');
    p.circle(0, -r*0.2, r*0.8);
    dc.shadowColor = '#ff0000'; dc.shadowBlur = 20;
    p.fill('#ff0000');
    p.circle(0, -r*0.2, r*0.3);
    dc.shadowBlur = 0;
}

// 🥷 CYBER NINJA (Blade)
function _drawBlade(r) {
    const dc = p.drawingContext;
    p.fill('#111'); p.noStroke();
    p.circle(0, 0, r * 2);

    // Cyan Headband
    p.fill('#00ffff');
    p.rect(-r, -r*0.4, r*2, r*0.3);
    dc.shadowColor = '#00ffff'; dc.shadowBlur = 10;
    p.fill('#00ffff');
    p.circle(-r*0.3, -r*0.25, r*0.15); p.circle(r*0.3, -r*0.25, r*0.15);
    dc.shadowBlur = 0;

    // Digital Scarf
    p.fill('#00ffff44');
    p.triangle(-r, r*0.5, r, r*0.5, 0, r*1.5);
}

// 🏹 TECH ARCHER (Archer)
function _drawArcher(r) {
    const dc = p.drawingContext;
    p.fill('#228B22'); p.noStroke();
    p.circle(0, 0, r * 2);

    // Green Visor
    p.fill('#111');
    p.rect(-r*0.7, -r*0.4, r*1.4, r*0.4, r*0.1);
    p.fill('#00ff00');
    p.rect(-r*0.6, -r*0.3, r*1.2, r*0.1);

    // Energy Bow
    p.stroke('#00ff00'); p.strokeWeight(4); p.noFill();
    p.arc(r*0.6, 0, r*1.2, r*1.5, -1, 1);
}

// ⚕️ BIO-HEALER (Medic)
function _drawMedic(r) {
    const dc = p.drawingContext;
    p.fill('#f0f0f0'); p.noStroke();
    p.circle(0, 0, r * 2);

    // Green Cross Visor
    p.fill('#00ff88');
    p.rect(-r*0.1, -r*0.5, r*0.2, r*1.0);
    p.rect(-r*0.5, -r*0.1, r*1.0, r*0.2);

    p.fill('#333');
    p.circle(-r*0.3, -r*0.2, r*0.2); p.circle(r*0.3, -r*0.2, r*0.2);
}

// 💣 BLAST KING (Bombardier)
function _drawBombardier(r) {
    const dc = p.drawingContext;
    p.fill('#cc3300'); p.noStroke();
    p.circle(0, 0, r * 2);

    // TNT Crown
    p.fill('#ffd700');
    for(let i=-1; i<=1; i++) {
        p.rect(i*r*0.4 - r*0.1, -r*1.2, r*0.2, r*0.5);
    }
    p.rect(-r*0.5, -r*0.8, r*1.0, r*0.2);

    // Royal Cape
    p.fill('#880000');
    p.arc(0, 0, r*2.2, r*2.2, 0.5, Math.PI - 0.5);
    
    p.fill('#000');
    p.circle(-r*0.3, -r*0.1, r*0.2); p.circle(r*0.3, -r*0.1, r*0.2);
}

export function drawRespawnOverlay(player) {
    if (!player || !player.respawning) return;
    const secs = Math.ceil(player.respawning / 1000);
    const dc   = p.drawingContext;

    p.push();
    dc.globalAlpha = 0.55;
    p.fill(0);
    p.noStroke();
    p.rect(0, 0, p.width, p.height);
    dc.globalAlpha = 1;

    p.textAlign(p.CENTER, p.CENTER);
    p.textFont('Bangers');
    p.textSize(96);
    p.fill(255, 80, 80);
    p.noStroke();
    p.text(secs, p.width / 2, p.height / 2 - 30);

    p.textSize(28);
    p.fill(220, 220, 220);
    p.text('RESPAWNING...', p.width / 2, p.height / 2 + 55);
    p.pop();
}

export function drawMinimap() {
    if (!gameState.player) return;

    const dc   = p.drawingContext;
    const WW   = CONFIG.WORLD_WIDTH;
    const WH   = CONFIG.WORLD_HEIGHT;
    const MW   = 130, MH = 90;
    const MX   = 16,  MY = 16;
    const scaleX = MW / WW;
    const scaleY = MH / WH;

    const wx = (x) => MX + x * scaleX;
    const wy = (y) => MY + y * scaleY;

    p.push();
    dc.globalAlpha = 0.80;
    p.fill(8, 8, 24);
    p.noStroke();
    p.rect(MX, MY, MW, MH, 5);
    dc.globalAlpha = 1;

    p.stroke('rgba(255,255,255,0.25)');
    p.strokeWeight(1);
    p.noFill();
    p.rect(MX, MY, MW, MH, 5);

    p.fill(55, 38, 110);
    p.noStroke();
    gameState.walls.forEach(w => {
        p.rect(wx(w.x), wy(w.y), Math.max(1, w.w * scaleX), Math.max(1, w.h * scaleY));
    });

    p.fill('#00d4ff');
    p.noStroke();
    gameState.gems.forEach(g => {
        if (!g.collected) p.circle(wx(g.x), wy(g.y), 3);
    });

    p.fill('#ff3366');
    gameState.enemies.forEach(e => {
        if (e.hp > 0) p.circle(wx(e.x), wy(e.y), 4);
    });

    dc.shadowColor = '#00d4ff';
    dc.shadowBlur  = 5;
    p.fill('#00d4ff');
    p.circle(wx(gameState.player.x), wy(gameState.player.y), 6);
    dc.shadowBlur = 0;

    p.fill('rgba(255,255,255,0.35)');
    p.noStroke();
    p.textAlign(p.RIGHT, p.BOTTOM);
    p.textFont('Roboto');
    p.textSize(9);
    p.text('MAP', MX + MW - 3, MY + MH - 2);

    p.pop();
}

