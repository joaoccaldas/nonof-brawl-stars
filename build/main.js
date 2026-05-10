/**
 * main.js — p5.js instance-mode sketch
 *
 * Owns: game loop (setup/draw), player update, all game-feel systems.
 * Logic modules (config, state, combat, ai, effects, audio) are untouched.
 */

import { CONFIG, BRAWLERS, BIOMES, GAME_MODES }  from './modules/config.js';
import { gameState, initPlayer, resetGameState, setupHeist, setupModeUI, updateCurrencyDisplay } from './modules/state.js';
import { input, setupInputHandlers, updateKeyboardMovement, setMouseAim } from './modules/input.js';
import {
    initRenderer, clear, beginCamera, endCamera,
    drawWorld, drawGems, drawBullets, drawBrawler,
    drawFloatingText, drawDeathRing, drawZone,
    drawParticleEffects, updateCamera, drawDyingBrawler,
    drawRespawnOverlay, drawMinimap, drawGasVignette, drawGemMine
} from './modules/render.js';
import { fireBullet, activateSuper, updateBullets, checkBulletHits, checkWallCollision, collectGems, collectPowerCubes } from './modules/combat.js';
import { updateAI, spawnEnemies } from './modules/ai.js';
import { MAPS, TILE_SIZE, getRandomMap } from './modules/maps.js';
import { spawnParticles, spawnDmgNumber, spawnPickupText, spawnDeathRing, spawnZone, triggerShake as _triggerShake } from './modules/effects.js';
import { initAudio, playMusic, stopMusic, setSFXEnabled, setMusicEnabled, sfxShoot, sfxHit, sfxDeath, sfxPickup, sfxSuper, sfxPlayerHit, sfxMechShoot, sfxNinjaShoot, sfxArcherShoot, sfxDJShoot } from './modules/audio.js';

// ── Dying entity animations ───────────────────────────────────────────────────

const dyingEntities = [];

function spawnDyingEntity(enemy) {
    dyingEntities.push({
        x: enemy.x, y: enemy.y,
        radius: enemy.radius,
        brawlerId: enemy.brawler.id,
        spinAngle: enemy.angle,
        spinSpeed: (Math.random() - 0.5) * 0.22,
        scale: 1.0,
        opacity: 1.0,
        timer: 500,
        maxTimer: 500
    });
}

function updateDyingEntities(dt) {
    for (let i = dyingEntities.length - 1; i >= 0; i--) {
        const de = dyingEntities[i];
        de.timer     -= dt;
        de.spinAngle += de.spinSpeed;
        de.opacity    = de.timer / de.maxTimer;
        de.scale      = 0.25 + 0.75 * de.opacity;
        if (de.timer <= 0) dyingEntities.splice(i, 1);
    }
}

// ── Particle / floating text / death ring / zone updates ─────────────────────

function updateParticles(dt) {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.88; p.vy *= 0.88;
        p.life -= dt / 380;
        if (p.life <= 0) gameState.particles.splice(i, 1);
    }
}

function updateFloatingTexts(dt) {
    for (let i = gameState.floatingTexts.length - 1; i >= 0; i--) {
        const ft = gameState.floatingTexts[i];
        ft.y    += ft.vy;
        ft.life -= dt / 900;
        if (ft.life <= 0) gameState.floatingTexts.splice(i, 1);
    }
}

function updateDeathRings(dt) {
    for (let i = gameState.deathRings.length - 1; i >= 0; i--) {
        const d = gameState.deathRings[i];
        d.timer  -= dt;
        d.alpha   = d.timer / 520;
        d.radius  = 28 + (1 - d.alpha) * 60;
        if (d.timer <= 0) gameState.deathRings.splice(i, 1);
    }
}

function updateZones(dt) {
    for (let i = gameState.zones.length - 1; i >= 0; i--) {
        const z = gameState.zones[i];
        z.timer -= dt;
        if (z.type === 'healing') {
            if (Math.floor(z.timer / 500) !== Math.floor((z.timer + dt) / 500)) {
                [gameState.player, ...gameState.enemies].forEach(ent => {
                    if (ent && ent.hp > 0 && ent.team === z.team) {
                        if (Math.hypot(ent.x - z.x, ent.y - z.y) < z.radius) {
                            ent.hp = Math.min(ent.maxHp, ent.hp + 150);
                            spawnParticles(ent.x, ent.y, '#00ff88', 2);
                        }
                    }
                });
            }
        }
        if (z.timer <= 0) gameState.zones.splice(i, 1);
    }
}

export function triggerShake(intensity) { _triggerShake(intensity); }

function showKillBanner(name) {
    const banner = document.getElementById('killBanner');
    if (!banner) return;
    banner.textContent = `ELIMINATED ${name.toUpperCase()}!`;
    banner.classList.add('active');
    setTimeout(() => banner.classList.remove('active'), 2500);
}

// ── Screen management ─────────────────────────────────────────────────────────

function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    ['gameUI', 'victoryScreen', 'defeatScreen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    // Handle screens whose id doesn't follow *Screen pattern
    const idMap = { matchmaking: 'matchmakingOverlay' };
    const targetId = idMap[name] ? idMap[name] : `${name}Screen`;
    const el = document.getElementById(targetId);
    if (el) el.classList.remove('hidden');
}

// ── Brawler / skin select ─────────────────────────────────────────────────────

const BRAWLER_ICONS = {
    bear:'🐻', caveman:'🏋️', eagle:'🦅', hex:'🧙',
    ironclad:'🤖', blade:'🥷', archer:'🏹', medic:'⚕️', bombardier:'💣'
};

function renderBrawlerSelect() {
    const grid = document.getElementById('brawlerGrid');
    grid.innerHTML = Object.values(BRAWLERS).map(b => {
        const isLocked = !b.unlocked;
        const level = gameState.brawlerLevels[b.id] || 1;
        const cost = level * 150;
        const canUpgrade = !isLocked && gameState.coins >= cost;
        
        return `
            <div class="brawler-card ${gameState.selectedBrawler === b.id ? 'selected' : ''} ${isLocked ? 'locked' : ''}">
                <div onclick="${isLocked ? '' : `window.brawlGame.selectBrawler('${b.id}')`}" style="height: 100%;">
                    <div style="width:100%;height:55%;display:flex;align-items:center;justify-content:center;background:${b.color}22; filter: ${isLocked ? 'grayscale(1) opacity(0.5)' : 'none'};">
                        <img src="${b.image}" alt="${b.name}" class="${!isLocked ? 'brawler-splash-animate' : ''}" style="max-height:80%; max-width:80%; object-fit:contain; filter: drop-shadow(0 0 8px ${b.color}88);" onerror="this.outerHTML='<div style=\\'font-size:56px\\'>${BRAWLER_ICONS[b.id] || '👤'}</div>'">
                    </div>
                    <div class="name">${b.name}</div>
                    <div class="stats" style="color:var(--brawl-gold)">POWER LVL ${level}</div>
                    <div class="stats">${isLocked ? `🏆 ${b.unlockTrophies}` : `HP ${Math.floor(b.hp * (1 + (level-1)*0.05))} · DMG ${Math.floor(b.damage * (1 + (level-1)*0.05))}`}</div>
                    ${isLocked ? '<div style="position:absolute; top:10px; right:10px; font-size:24px;">🔒</div>' : ''}
                </div>
                ${!isLocked && level < 10 ? `
                    <button class="road-btn" style="position:absolute; bottom:5px; left:50%; transform:translateX(-50%); padding:4px 10px; font-size:12px; width:90%; opacity:${canUpgrade ? 1 : 0.5}" 
                            onclick="event.stopPropagation(); window.brawlGame.upgradeBrawler('${b.id}')">
                        UPGRADE 💰 ${cost}
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
    
    // Enable/disable confirm button
    const confirmBtn = document.getElementById('confirmBrawlerBtn');
    if (confirmBtn) {
        confirmBtn.style.opacity = gameState.selectedBrawler ? '1' : '0.5';
        confirmBtn.style.pointerEvents = gameState.selectedBrawler ? 'auto' : 'none';
    }
}

function selectBrawler(id) {
    gameState.selectedBrawler = id;
    renderBrawlerSelect(); 
}

function confirmBrawlerSelection() {
    const id = gameState.selectedBrawler;
    if (!id) return;
    const brawler = BRAWLERS[id];
    if (brawler.skins && brawler.skins.length > 1) {
        populateSkinGrid(brawler);
        showScreen('skinSelect');
    } else {
        gameState.selectedSkin = 'default';
        showScreen('modeSelect');
    }
}

function populateSkinGrid(brawler) {
    const skinGrid = document.getElementById('skinGrid');
    skinGrid.innerHTML = '';
    brawler.skins.forEach((skin, idx) => {
        const isDefault = skin.id === 'default';
        const isLocked = !isDefault && idx > 1 && gameState.coins < 50; // Simple mock lock logic
        const card = document.createElement('div');
        card.className = `brawler-card ${isLocked ? 'locked' : ''}`;
        card.style.position = 'relative';
        if (!isLocked) card.onclick = () => selectSkin(skin.id);
        
        card.innerHTML = `
            <div style="width:100%;height:65%;display:flex;align-items:center;justify-content:center; filter: ${isLocked ? 'grayscale(1) opacity(0.5)' : 'none'}; background:${brawler.color}22;">
                <img src="${skin.image || brawler.image}" alt="${skin.name}" style="max-height:80%; max-width:80%; object-fit:contain; filter: drop-shadow(0 0 8px ${brawler.color}88);" onerror="this.outerHTML='<div style=\\'font-size:56px\\'>${BRAWLER_ICONS[brawler.id] || '⚡'}</div>'">
            </div>
            <div class="name">${skin.name}</div>
            <div style="font-size:12px; color:${isLocked ? 'var(--brawl-red)' : 'var(--brawl-green)'}; font-family:Bangers;">
                ${isDefault ? 'OWNED' : (isLocked ? '💰 50' : 'FREE')}
            </div>
            ${isLocked ? '<div style="position:absolute; top:10px; right:10px; font-size:24px;">🔒</div>' : ''}
        `;
        skinGrid.appendChild(card);
    });
}

function selectSkin(skinId) {
    gameState.selectedSkin = skinId;
    showScreen('modeSelect');
}

function selectMode(mode, el) {
    gameState.gameMode = mode;
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

// ── World generation ──────────────────────────────────────────────────────────

function generateWorld() {
    const mapData = getRandomMap(gameState.gameMode);
    gameState.waterTiles = [];
    gameState.jumpPads = [];
    for (let y = 0; y < mapData.length; y++) {
        const row = mapData[y];
        for (let x = 0; x < row.length; x++) {
            const tile = row[x];
            const px = x * TILE_SIZE, py = y * TILE_SIZE;
            if (tile === '#') gameState.walls.push({ x: px, y: py, w: TILE_SIZE, h: TILE_SIZE });
            else if (tile === '*') gameState.bushes.push({ x: px, y: py, w: TILE_SIZE, h: TILE_SIZE });
            else if (tile === '~') gameState.waterTiles.push({ x: px, y: py, w: TILE_SIZE, h: TILE_SIZE });
            else if (tile === '^') gameState.jumpPads.push({ x: px, y: py, w: TILE_SIZE, h: TILE_SIZE, targetX: px + 600, targetY: py });
        } 
    } 
    if (gameState.gameMode === "heist") { 
        setupHeist(); 
    } 
} 

let gemSpawnTimer = 0;
let mineRumble    = 0; // 0..1, peaks just before a gem ejects
function spawnGems() {
    gemSpawnTimer = 0;
    mineRumble    = 0;
}

function _doStartGame() {
    if (!gameState.selectedBrawler) return;
    resetGameState(gameState.gameMode);
    gameState.player      = initPlayer(gameState.selectedBrawler);
    gameState.player.skin = gameState.selectedSkin || 'default';
    gameState.biome       = (GAME_MODES[gameState.gameMode] || {}).biome || 'grassland';
    generateWorld();
    spawnEnemies();
    if (gameState.gameMode === 'gemGrab') spawnGems();
    
    dyingEntities.length = 0;
    setMouseAim(gameState.player.x + 1, gameState.player.y);
    
    const _maxAmmo = gameState.player.brawler.maxAmmo || 3;
    const ammoBar = document.getElementById('ammoBar');
    if (ammoBar) {
        ammoBar.innerHTML = Array.from({ length: _maxAmmo }, () =>
            '<div class="ammo-slot"><div class="ammo-fill"></div></div>'
        ).join('');
    }
    
    showScreen('game');
    document.getElementById('gameUI').classList.remove('hidden');
    
    const pauseBtn = document.getElementById('inGameMenuBtn');
    if (pauseBtn) pauseBtn.textContent = 'MENU';
    
    setupModeUI();
    initAudio();
    playMusic('battle');
    updateHUD();
    gameState.running = true;
}

function startGame() {
    if (!gameState.selectedBrawler) return;
    showMatchmakingScreen();
}

function showMatchmakingScreen() {
    const overlay = document.getElementById('matchmakingOverlay');
    if (!overlay) { _doStartGame(); return; }

    showScreen('matchmaking');
    
    const container = document.getElementById('mmSlotsContainer');
    const barFill   = document.getElementById('mmProgressFill');
    const countText = document.getElementById('mmCountdown');
    
    if (!container) { _doStartGame(); return; }
    container.innerHTML = '';
    if (barFill) barFill.style.width = '0%';
    if (countText) countText.textContent = 'SEARCHING...';

    // Mode label
    const modeLabel = document.getElementById('mmModeLabel');
    if (modeLabel) modeLabel.textContent = (GAME_MODES[gameState.gameMode]?.name || 'BRAWL').toUpperCase();

    // Prepare participants: player + 5 randoms
    const brawlerList = Object.values(BRAWLERS);
    const participants = [
        { id: gameState.selectedBrawler, name: 'YOU' },
        ...Array.from({ length: 5 }, () => {
            const b = brawlerList[Math.floor(Math.random() * brawlerList.length)];
            return { id: b.id, name: 'BOT_' + Math.floor(Math.random() * 999) };
        })
    ];

    // Create empty slots
    const slotEls = participants.map((p, i) => {
        const el = document.createElement('div');
        el.className = 'mm-slot';
        el.innerHTML = `
            <div class="mm-avatar">${BRAWLER_ICONS[p.id] || '👤'}</div>
            <div class="mm-name">${p.name}</div>
        `;
        container.appendChild(el);
        return el;
    });

    // Sequential join simulation
    let connected = 0;
    const total = participants.length;
    
    const connectNext = () => {
        if (connected >= total) {
            setTimeout(_doStartGame, 800);
            return;
        }
        
        const el = slotEls[connected];
        el.classList.add('mm-connected');
        connected++;
        
        if (barFill) barFill.style.width = (connected / total * 100) + '%';
        if (countText) countText.textContent = `${connected}/${total} PLAYERS FOUND`;
        
        sfxPickup(); // "Ready" sound
        
        const nextDelay = 300 + Math.random() * 800;
        setTimeout(connectNext, nextDelay);
    };

    setTimeout(connectNext, 500);
}


function showMenuBrawlerPreview() {
    const container = document.getElementById('menuBrawlerPreview');
    if (!container) return;
    
    // Clear old state
    container.innerHTML = '';
    
    // Current selected brawler
    const id = gameState.selectedBrawler || 'bear';
    const b = BRAWLERS[id];
    const skinId = gameState.selectedSkin || 'default';
    const skinPath = skinId === 'default' ? b.image : (b.skins?.find(s=>s.id===skinId)?.image || b.image);

    // Create Brawler Image
    const img = document.createElement('img');
    img.src = skinPath;
    img.className = 'brawler-splash-animate';
    img.style.cssText = `max-width: 90%; max-height: 90%; object-fit: contain; filter: drop-shadow(0 0 15px ${b.color}); color: ${b.color};`;
    img.onerror = () => {
        img.outerHTML = `<div style="font-size: 140px; filter: drop-shadow(0 0 20px ${b.color});" class="brawler-splash-animate">${BRAWLER_ICONS[id] || '👤'}</div>`;
    };
    container.appendChild(img);

    // Spawn subtle floating particles around the brawler
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'brawler-particle';
        const angle = Math.random() * Math.PI * 2;
        const dist  = 60 + Math.random() * 100;
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.width = (4 + Math.random() * 6) + 'px';
        p.style.height = p.style.width;
        p.style.background = b.color;
        p.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
        p.style.setProperty('--dy', (Math.sin(angle) * dist) + 'px');
        p.style.animationDelay = (Math.random() * 4) + 's';
        container.appendChild(p);
    }
}

function endMatch(victory) {
    const oldTrophies = gameState.trophies;
    if (victory) { gameState.trophies += 8;  gameState.coins += 20; }
    else         { gameState.trophies = Math.max(0, gameState.trophies - 4); }
    const delta = gameState.trophies - oldTrophies;

    gameState.running   = false;
    gameState.paused    = false;
    gameState.isGameActive = false;
    document.getElementById('pauseMenuScreen').classList.add('hidden');

    const prefix = victory ? 'victory' : 'defeat';
    const infoId = prefix + 'Info';
    showScreen(prefix);
    
    // Set match stats
    document.getElementById(infoId).textContent =
        gameState.gameMode === 'gemGrab'  ? `Gems Collected: ${gameState.teamGems}` :
        gameState.gameMode === 'showdown' ? `Rank: ${gameState.playersLeft}` : 'Match Finished';

    // Animate rewards
    const trophyVal = document.getElementById(prefix + 'Trophies');
    const coinVal   = document.getElementById(prefix + 'Coins');
    const totalVal  = document.getElementById(prefix + 'TotalTrophies');
    const barFill   = document.getElementById(prefix + 'TrophyBar');

    if (trophyVal) trophyVal.textContent = (delta >= 0 ? '+' : '') + delta;
    if (coinVal && victory) coinVal.textContent = '+20';
    if (totalVal) totalVal.textContent = gameState.trophies;

    // Bar animation: (current trophies % 100) as a simple progress to "next level"
    if (barFill) {
        barFill.style.width = '0%';
        setTimeout(() => {
            const progress = (gameState.trophies % 100);
            barFill.style.width = progress + '%';
        }, 800);
    }

    saveProfile(victory);
    updateQuests(victory);
    updateCurrencyDisplay();
    updateLandingStats();
    playMusic('menu');
}

function saveProfile(isWin) {
    const stats = JSON.parse(localStorage.getItem('brawl_stats') || '{"trophies":0,"coins":100,"matches":0,"wins":0,"kills":0,"unlockedBrawlers":["bear","archer"]}');
    stats.trophies = gameState.trophies;
    stats.coins    = gameState.coins;
    stats.matches++;
    if (isWin) stats.wins++;
    stats.kills += (gameState.player.kills || 0);
    
    const unlocked = [];
    Object.keys(BRAWLERS).forEach(id => {
        if (BRAWLERS[id].unlocked) unlocked.push(id);
    });
    stats.unlockedBrawlers = unlocked;
    stats.quests = gameState.quests;
    stats.brawlerLevels = gameState.brawlerLevels;

    localStorage.setItem('brawl_stats', JSON.stringify(stats));
}


function loadProfile() {
    const stats = JSON.parse(localStorage.getItem('brawl_stats') || '{"trophies":0,"coins":100,"matches":0,"wins":0,"kills":0,"unlockedBrawlers":["bear","archer"],"quests":[],"brawlerLevels":{}}');
    gameState.trophies = stats.trophies;
    gameState.coins    = stats.coins;
    gameState.quests   = stats.quests || [];
    gameState.brawlerLevels = stats.brawlerLevels || {};
    
    if (gameState.quests.length === 0) generateDailyQuests();

    // Sync config with saved unlocks
    const unlockedList = stats.unlockedBrawlers || ["bear","archer"];
    Object.keys(BRAWLERS).forEach(id => {
        BRAWLERS[id].unlocked = unlockedList.includes(id);
    });

    updateLandingStats();
}

function updateLandingStats() {
    const t = document.getElementById('landingTrophies');
    const c = document.getElementById('landingCoins');
    if (t) t.textContent = gameState.trophies;
    if (c) c.textContent = gameState.coins;
    renderQuests();
}

function generateDailyQuests() {
    const types = [
        { id: 'damage', label: 'Deal Damage', goal: 5000, reward: 50 },
        { id: 'kills', label: 'Eliminate Enemies', goal: 10, reward: 100 },
        { id: 'wins', label: 'Win Matches', goal: 3, reward: 150 }
    ];
    gameState.quests = types.map(t => ({
        ...t,
        progress: 0,
        completed: false,
        claimed: false
    }));
}

function updateQuests(isWin) {
    const kills = (gameState.player.kills || 0);
    const damage = 500; // Mock damage for now
    
    gameState.quests.forEach(q => {
        if (q.claimed) return;
        if (q.id === 'damage') q.progress += damage;
        if (q.id === 'kills') q.progress += kills;
        if (q.id === 'wins' && isWin) q.progress += 1;
        
        if (q.progress >= q.goal) q.completed = true;
    });
    saveProfile(false);
}

function renderQuests() {
    const container = document.getElementById('questContainer');
    if (!container) return;
    
    container.innerHTML = gameState.quests.filter(q => !q.claimed).map(q => `
        <div class="quest-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="quest-title">${q.label}</div>
                <div class="quest-reward">💰 ${q.reward}</div>
            </div>
            <div class="quest-progress-bar">
                <div class="quest-progress-fill" style="width: ${Math.min(100, (q.progress/q.goal)*100)}%;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:12px; opacity:0.7;">${q.progress} / ${q.goal}</div>
                ${q.completed ? `<button class="road-btn" style="padding:4px 12px; font-size:14px;" onclick="window.brawlGame.claimQuest('${q.id}')">CLAIM</button>` : ''}
            </div>
        </div>
    `).join('');
}

function claimQuest(typeId) {
    const q = gameState.quests.find(q => q.id === typeId);
    if (q && q.completed && !q.claimed) {
        q.claimed = true;
        gameState.coins += q.reward;
        spawnParticles(window.innerWidth/2, window.innerHeight/2, '#00e5ff', 30);
        sfxPickup();
        saveProfile(false);
        updateLandingStats();
    }
}

function upgradeBrawler(id) {
    const level = gameState.brawlerLevels[id] || 1;
    const cost = level * 150;
    if (gameState.coins >= cost && level < 10) {
        gameState.coins -= cost;
        gameState.brawlerLevels[id] = level + 1;
        sfxSuper(); // Celebration sound
        spawnParticles(window.innerWidth/2, window.innerHeight/2, '#ffd700', 40);
        saveProfile(false);
        renderBrawlerSelect();
        updateLandingStats();
    }
}

function showTrophyRoad() {
    showScreen('trophyRoad');
    const roadScroll = document.getElementById('roadScroll');
    if (!roadScroll) return;
    
    roadScroll.innerHTML = '';
    
    // Sort brawlers by trophy requirement
    const sortedBrawlers = Object.values(BRAWLERS).sort((a, b) => a.unlockTrophies - b.unlockTrophies);
    
    sortedBrawlers.forEach(b => {
        const isUnlocked = b.unlocked;
        const canClaim   = !isUnlocked && gameState.trophies >= b.unlockTrophies;
        const item = document.createElement('div');
        item.className = `road-item ${isUnlocked ? 'unlocked' : (canClaim ? 'claimable' : '')}`;
        
        item.innerHTML = `
            <div class="road-icon">${BRAWLER_ICONS[b.id] || '👤'}</div>
            <div class="road-info">
                <div class="road-trophies">${b.unlockTrophies} 🏆</div>
                <div class="road-name">${b.name}</div>
            </div>
            <button class="road-btn ${(!canClaim && !isUnlocked) ? 'disabled' : ''}" 
                    onclick="${canClaim ? `window.brawlGame.claimBrawler('${b.id}')` : ''}">
                ${isUnlocked ? 'UNLOCKED' : (canClaim ? 'CLAIM' : 'LOCKED')}
            </button>
        `;
        roadScroll.appendChild(item);
    });
}

function claimBrawler(id) {
    if (BRAWLERS[id] && gameState.trophies >= BRAWLERS[id].unlockTrophies) {
        BRAWLERS[id].unlocked = true;
        saveProfile(false); // Silent save
        spawnParticles(window.innerWidth/2, window.innerHeight/2, '#ffd700', 40, 'star');
        sfxSuper(); // Celebration sound
        showTrophyRoad(); // Refresh UI
    }
}

function openProfile() {
    const stats = JSON.parse(localStorage.getItem('brawl_stats') || '{"trophies":0,"coins":100,"matches":0,"wins":0,"kills":0}');
    const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
    
    document.getElementById('profPlayerName').textContent = 'NOAH_BRAWLER';
    document.getElementById('profTrophies').textContent = stats.trophies;
    document.getElementById('profMatches').textContent  = stats.matches;
    document.getElementById('profWins').textContent     = stats.wins;
    document.getElementById('profKills').textContent    = stats.kills;
    document.getElementById('profWinRate').textContent  = winRate + '%';
    
    showScreen('profile');
}

function openLeaderboard() {
    const list    = document.getElementById('leaderboardList');
    list.innerHTML = '';
    const entries = [
        { name:'LeonPro',     trophies:45200 },
        { name:'ShellyGod',   trophies:42100 },
        { name:'CrowKing',    trophies:38900 },
        { name:'YOU',         trophies:gameState.trophies, isUser:true },
        { name:'MortisDash',  trophies:31200 },
        { name:'BullCharge',  trophies:28500 }
    ];
    entries.sort((a, b) => b.trophies - a.trophies);
    entries.forEach((entry, i) => {
        const div = document.createElement('div');
        div.style.cssText = `display:flex;justify-content:space-between;align-items:center;
            padding:15px 25px;background:${entry.isUser ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)'};
            border-radius:12px;border:1px solid ${entry.isUser ? 'var(--brawl-blue)' : 'rgba(255,255,255,0.1)'};
            font-family:Bangers;font-size:22px;color:#fff;`;
        const namePart   = document.createElement('div');
        namePart.textContent = `${i+1}. ${entry.name}`;
        if (entry.isUser) namePart.style.color = 'var(--brawl-blue)';
        const trophPart  = document.createElement('div');
        trophPart.textContent = `🏆 ${entry.trophies}`;
        trophPart.style.color = 'var(--brawl-gold)';
        div.appendChild(namePart); div.appendChild(trophPart);
        list.appendChild(div);
    });
    showScreen('leaderboard');
}

function returnToMenu() {
    gameState.running = false;
    gameState.particles.length    = 0;
    gameState.floatingTexts.length = 0;
    gameState.deathRings.length   = 0;
    gameState.zones.length        = 0;
    dyingEntities.length          = 0;
    showScreen('landing');
    playMusic('menu');
    showMenuBrawlerPreview();
}

function toggleMusic() {
    gameState.musicEnabled = (gameState.musicEnabled === undefined) ? false : !gameState.musicEnabled;
    setMusicEnabled(gameState.musicEnabled);
    const btn = document.getElementById('musicToggle');
    if (btn) btn.classList.toggle('active', gameState.musicEnabled);
}

function toggleSFX() {
    gameState.sfxEnabled = (gameState.sfxEnabled === undefined) ? false : !gameState.sfxEnabled;
    setSFXEnabled(gameState.sfxEnabled);
    const btn = document.getElementById('sfxToggle');
    if (btn) btn.classList.toggle('active', gameState.sfxEnabled);
}

function updateUIScale(val) {
    document.documentElement.style.setProperty('--ui-scale', val);
    // Apply scale transform to main UI containers
    const containers = document.querySelectorAll('.screen');
    containers.forEach(c => c.style.transform = `scale(${val})`);
}


function retryMatch() { gameState.running = false; startGame(); }

// ── HUD ───────────────────────────────────────────────────────────────────────

function updateAmmoDisplay(now = Date.now()) {
    const player = gameState.player;
    if (!player) return;
    const maxAmmo     = player.brawler.maxAmmo || 3;
    const baseReloadMs = player.brawler.reload * 1000;
    const elapsed      = player._reloadStart ? now - player._reloadStart : 0;
    const reloadPct    = Math.min(100, (elapsed / baseReloadMs) * 100);

    document.querySelectorAll('.ammo-slot').forEach((slot, i) => {
        const fill = slot.querySelector('.ammo-fill');
        if (i < player.ammo) {
            slot.classList.add('full');
            slot.classList.remove('reloading');
            if (fill) fill.style.height = '0%';
        } else if (i === player.ammo && player.ammo < maxAmmo) {
            slot.classList.remove('full');
            slot.classList.add('reloading');
            if (fill) fill.style.height = `${reloadPct}%`;
        } else {
            slot.classList.remove('full');
            slot.classList.remove('reloading');
            if (fill) fill.style.height = '0%';
        }
    });
}

function updateSuperBar() {
    const charge = gameState.player?.superCharge ?? 0;
    document.getElementById('superBar').style.width = charge + '%';
    document.getElementById('superButton').classList.toggle('ready', charge >= 100);
}

function updateTimer() {
    const t    = Math.max(0, gameState.matchTime);
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    document.getElementById('timerDisplay').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateHUD() { updateAmmoDisplay(); updateSuperBar(); updateTimer(); }

// ── Kill Feed ─────────────────────────────────────────────────────────────────

function addKillFeedEntry(text) {
    const feed = document.getElementById('killFeed');
    if (!feed) return;
    const el = document.createElement('div');
    el.className = 'kill-entry';
    el.textContent = text;
    feed.appendChild(el);
    setTimeout(() => el.remove(), 3200);
    while (feed.children.length > 4) feed.firstChild.remove();
}

// ── Pause / quit ──────────────────────────────────────────────────────────────

export function togglePauseMenu() {
    gameState.paused = !gameState.paused;
    const btn = document.getElementById('inGameMenuBtn');
    document.getElementById('pauseMenuScreen').classList.toggle('hidden', !gameState.paused);
    if (btn) btn.textContent = gameState.paused ? 'RESUME' : 'MENU';
}

export function quitMatch() {
    gameState.paused = false;
    document.getElementById('pauseMenuScreen').classList.add('hidden');
    endMatch(false);
}

// ── Update (game logic) ───────────────────────────────────────────────────────

function update(dt) {
    if (!gameState.running || !gameState.player || gameState.paused) return;

    // Hit Stop (Juice) - freeze the world for massive impacts
    if (gameState.hitStop > 0) {
        gameState.hitStop -= dt;
        return;
    }

    const player = gameState.player;
    const now    = Date.now();

    // Passive Biome Effects (Item #14)
    if (Math.random() < 0.12) {
        const vx = (Math.random() - 0.5) * 1.5;
        const vy = (Math.random() - 0.5) * 1.5;
        const rx = player.x + (Math.random() - 0.5) * 1500;
        const ry = player.y + (Math.random() - 0.5) * 1500;
        
        if (gameState.biome === 'desert') {
            spawnParticles(rx, ry, '#e4d5b7', 1, 'square'); // Dust/Sand
        } else if (gameState.biome === 'cyber') {
            spawnParticles(rx, ry, '#00e5ff', 1, 'hex'); // Digital bits
        } else if (gameState.biome === 'grassland') {
            spawnParticles(rx, ry, '#2e7d32', 1, 'leaf'); // Falling leaves
        }
    }

    // Bush stealth + Rustle
    [player, ...gameState.enemies].forEach(ent => {
        if (!ent || ent.hp <= 0) return;
        ent.inBush = gameState.bushes.some(b => Math.hypot(ent.x - b.x, ent.y - b.y) < b.r);
        if (ent.inBush) {
            const moving = (ent === player) ? (Math.abs(input.moveX) > 0.1 || Math.abs(input.moveY) > 0.1) : true;
            if (moving && Math.random() < 0.15) {
                spawnParticles(ent.x, ent.y, '#2d5a27', 1);
            }
        }
        if (ent.revealedTimer > 0) ent.revealedTimer -= dt;
    });

    updateAmmoDisplay(now);

    // Movement with Momentum (Acceleration + Friction)
    updateKeyboardMovement();
    const acc = 2.2 * (dt / 16);
    const friction = 0.82;
    
    if (input.moveX !== 0 || input.moveY !== 0) {
        player.vx += input.moveX * acc;
        player.vy += input.moveY * acc;
    }
    
    // Apply friction
    player.vx *= friction;
    player.vy *= friction;
    
    // Cap speed
    const maxSpd = (player.speed || player.brawler.speed / 100) * (dt / 16) * 1.5;
    const currSpd = Math.hypot(player.vx, player.vy);
    if (currSpd > maxSpd) {
        player.vx = (player.vx / currSpd) * maxSpd;
        player.vy = (player.vy / currSpd) * maxSpd;
    }
    
    const nx = player.x + player.vx;
    const ny = player.y + player.vy;
    
    if (!checkWallCollision(nx, player.y, player.radius, true)) player.x = nx;
    else player.vx = 0;
    
    if (!checkWallCollision(player.x, ny, player.radius, true)) player.y = ny;
    else player.vy = 0;

    // Jump Pad Trigger
    if (!player.isJumping) {
        gameState.jumpPads.forEach(pad => {
            const dx = (player.x - (pad.x + pad.w/2));
            const dy = (player.y - (pad.y + pad.h/2));
            if (dx*dx + dy*dy < 4000) { // Radius check
                player.isJumping = true;
                player.jumpProgress = 0;
                player.jumpStartX = player.x;
                player.jumpStartY = player.y;
                player.jumpTargetX = pad.targetX;
                player.jumpTargetY = pad.targetY;
                spawnParticles(player.x, player.y, '#ffd700', 15, 'star');
                triggerShake(8);
            }
        });
    }

    // Jump Physics
    if (player.isJumping) {
        player.jumpProgress += 0.02 * (dt / 16);
        if (player.jumpProgress >= 1) {
            player.isJumping = false;
            player.x = player.jumpTargetX;
            player.y = player.jumpTargetY;
            spawnParticles(player.x, player.y, '#ffd700', 10);
            triggerShake(5);
        } else {
            // Parabolic arc lerp
            player.x = player.jumpStartX + (player.jumpTargetX - player.jumpStartX) * player.jumpProgress;
            player.y = player.jumpStartY + (player.jumpTargetY - player.jumpStartY) * player.jumpProgress;
            // Visual height (not reflected in x,y but used in rendering)
            player.z = Math.sin(player.jumpProgress * Math.PI) * 150;
        }
        return; // Skip normal movement/actions while jumping
    }
    
    player.x = Math.max(player.radius, Math.min(CONFIG.WORLD_WIDTH  - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(CONFIG.WORLD_HEIGHT - player.radius, player.y));

    // Aim & Smooth Rotation
    let targetAngle = player.angle;
    if (input.aimX !== 0 || input.aimY !== 0) {
        targetAngle = Math.atan2(input.aimY - player.y, input.aimX - player.x);
    } else if (Math.hypot(player.vx, player.vy) > 0.5) {
        targetAngle = Math.atan2(player.vy, player.vx);
    }
    
    // Smoothly lerp angle for "lean" effect
    const angleDiff = targetAngle - player.angle;
    player.angle += Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff)) * 0.22;
    player.currentAngle = player.angle;

    // Rage expiry
    if (player.rageActive && now > player.rageEndTime) player.rageActive = false;
    if (player.invulnerable > 0) player.invulnerable -= dt;

    // Shooting
    const attackReloadMs = player.rageActive ? player.brawler.reload * 600 : player.brawler.reload * 1000;
    if (input.shooting && player.ammo > 0 && now - player.lastShot > attackReloadMs) {
        player.lastShot = now;
        player.ammo--;
        const dmg = player.rageActive ? player.damage * 1.5 : player.damage;
        fireBullet(player, dmg, 'player');
        
        // Character specific sounds
        const bid = player.brawler.id;
        if (bid === 'ironclad') sfxMechShoot();
        else if (bid === 'blade') sfxNinjaShoot();
        else if (bid === 'archer') sfxArcherShoot();
        else if (bid === 'hex') sfxDJShoot();
        else sfxShoot();

        updateAmmoDisplay();
    }

    // Ammo regen — continuous independent timer; firing never delays reload
    const baseReloadMs = player.brawler.reload * 1000;
    const maxAmmo      = player.brawler.maxAmmo || 3;
    if (player.ammo < maxAmmo) {
        if (!player._reloadStart) player._reloadStart = now;
        if (now - player._reloadStart >= baseReloadMs) {
            player.ammo++;
            player._reloadStart = player.ammo < maxAmmo ? now : 0;
            updateAmmoDisplay();
        }
    } else {
        player._reloadStart = 0;
    }

    // Super
    if (input.superActive && player.superCharge >= 100) {
        activateSuper(player);
        player.superCharge = 0;
        input.superActive  = false;
        updateSuperBar();
        spawnParticles(player.x, player.y, player.brawler.color, 18);
        triggerShake(6);
        sfxSuper();
    }

    updateBullets(dt);

    // Hit resolution
    const hits = checkBulletHits();
    for (const hit of hits) {
        if (hit.type === 'enemy') {
            spawnDmgNumber(hit.target.x, hit.target.y - hit.target.radius - 10, Math.round(hit.damage), '#ff6b35');
            sfxHit();
            if (hit.died) {
                spawnDyingEntity(hit.target);
                spawnDeathRing(hit.target.x, hit.target.y, hit.target.brawler.color);
                addKillFeedEntry(`You eliminated ${hit.target.brawler.name}!`);
                showKillBanner(hit.target.brawler.name);
                triggerShake(10);
                sfxDeath();
            } else {
                const kb = Math.atan2(hit.target.y - player.y, hit.target.x - player.x);
                const kd = hit.knockback ?? 22;
                const kx = hit.target.x + Math.cos(kb) * kd;
                const ky = hit.target.y + Math.sin(kb) * kd;
                if (!checkWallCollision(kx, hit.target.y, hit.target.radius)) hit.target.x = kx;
                if (!checkWallCollision(hit.target.x, ky, hit.target.radius)) hit.target.y = ky;
                spawnParticles(hit.target.x, hit.target.y, '#ff6b35', 5);
            }
            updateSuperBar();
        } else if (hit.type === 'player') {
            spawnDmgNumber(player.x, player.y - player.radius - 10, Math.round(hit.damage), '#ff3366');
            spawnParticles(player.x, player.y, '#ff3366', hit.died ? 16 : 8);
            triggerShake(hit.died ? 18 : 10);
            sfxPlayerHit();
        } else if (hit.type === 'safe') {
            spawnParticles(gameState.enemySafe.x, gameState.enemySafe.y, '#ffd700', 4);
            spawnDmgNumber(gameState.enemySafe.x, gameState.enemySafe.y - 80, Math.round(hit.damage), '#ffd700');
        }
    }

    // Gem collection
    if (gameState.gameMode === 'gemGrab') {
        const before = player.gems;
        collectGems(player);
        if (player.gems > before) {
            spawnPickupText(player.x, player.y - player.radius - 10, '+GEM', '#00d4ff');
            spawnParticles(player.x, player.y, '#00d4ff', 6);
            sfxPickup();
        }
        gameState.enemies.forEach(e => collectGems(e));
        
        gameState.teamGems = player.gems + gameState.enemies.filter(e => e.team === player.team).reduce((s, e) => s + e.gems, 0);
        gameState.enemyGems = gameState.enemies.filter(e => e.team !== player.team).reduce((s, e) => s + e.gems, 0);
        
        document.getElementById('teamGems').textContent  = gameState.teamGems;
        document.getElementById('enemyGems').textContent = gameState.enemyGems;
        if (gameState.teamGems  >= CONFIG.MAX_GEMS) { endMatch(true);  return; }
        if (gameState.enemyGems >= CONFIG.MAX_GEMS) { endMatch(false); return; }
        
        // Continuous spawn — mine rumbles 800ms before ejecting
        gemSpawnTimer -= dt;
        const SPAWN_INTERVAL = 3500;
        mineRumble = gemSpawnTimer < 800 && gameState.gems.length < 15
            ? Math.max(0, 1 - gemSpawnTimer / 800) : 0;

        if (gemSpawnTimer <= 0 && gameState.gems.length < 15) {
            gemSpawnTimer = SPAWN_INTERVAL;
            mineRumble = 0;
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 1.4;
            gameState.gems.push({
                x: CONFIG.WORLD_WIDTH  / 2,
                y: CONFIG.WORLD_HEIGHT / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: CONFIG.GEM_RADIUS,
                collected: false
            });
            // Spawn particle burst from mine
            for (let i = 0; i < 12; i++) {
                const a = (Math.PI * 2 / 12) * i;
                gameState.particles.push({
                    x: CONFIG.WORLD_WIDTH  / 2,
                    y: CONFIG.WORLD_HEIGHT / 2,
                    vx: Math.cos(a) * (2 + Math.random() * 3),
                    vy: Math.sin(a) * (2 + Math.random() * 3),
                    color: '#00e5ff', type: 'star',
                    life: 1.0, r: 4 + Math.random() * 5,
                    rotation: 0, vr: 0.1
                });
            }
        }
        // Apply gem velocity (slide out of mine)
        gameState.gems.forEach(g => {
            if (g.vx || g.vy) {
                g.x += g.vx; g.y += g.vy;
                g.vx *= 0.88; g.vy *= 0.88;
                if (Math.hypot(g.vx, g.vy) < 0.05) { g.vx = 0; g.vy = 0; }
            }
        });
    }

    // Power cubes (showdown)
    if (gameState.gameMode === 'showdown') {
        collectPowerCubes(player);
        gameState.enemies.forEach(e => collectPowerCubes(e));
    }

    // Showdown gas
    if (gameState.gameMode === 'showdown') {
        const dist = Math.hypot(player.x - CONFIG.WORLD_WIDTH / 2, player.y - CONFIG.WORLD_HEIGHT / 2);
        if (dist > gameState.gasRadius) {
            player.hp -= 2.5 * (dt / 16.67);
            if (Math.random() < 0.12) spawnParticles(player.x, player.y, '#8b2be2', 3);
        }
        gameState.gasRadius = Math.max(350, 1600 - (180 - gameState.matchTime) * 7.5);
        document.getElementById('playersLeft').textContent = gameState.enemies.length + 1;
        if (gameState.enemies.length === 0) { endMatch(true); return; }
    }

    // Heist
    if (gameState.gameMode === 'heist') {
        const safePct      = Math.max(0, Math.ceil((gameState.safe.hp      / gameState.safe.maxHp)      * 100));
        const enemySafePct = Math.max(0, Math.ceil((gameState.enemySafe.hp / gameState.enemySafe.maxHp) * 100));
        document.getElementById('safeHpText').textContent      = safePct + '%';
        document.getElementById('enemySafeHpText').textContent = enemySafePct + '%';
        if (gameState.enemySafe.hp <= 0) { endMatch(true);  return; }
        if (gameState.safe.hp      <= 0) { endMatch(false); return; }
    }

    // Player death / respawn
    if (player.hp <= 0 && !player.respawning) {
        if (gameState.gameMode === 'showdown') { endMatch(false); return; }
        player.respawning = 3000;
        if (player.gems > 0 && gameState.gameMode === 'gemGrab') {
            for (let g = 0; g < player.gems; g++) {
                gameState.gems.push({ x: player.x + (Math.random()-0.5)*60, y: player.y + (Math.random()-0.5)*60, radius: CONFIG.GEM_RADIUS, collected: false });
            }
            player.gems = 0;
            gameState.teamGems = 0;
        }
        player.x = -1000; player.y = -1000;
        spawnParticles(player.x, player.y, '#ff3366', 20);
    }
    if (player.respawning > 0) {
        player.respawning -= dt;
        if (player.respawning <= 0) {
            player.hp = player.maxHp;
            player.x  = 300 + Math.random() * 500;
            player.y  = 80  + Math.random() * (CONFIG.WORLD_HEIGHT - 160);
            player.invulnerable = 3000;
            delete player.respawning;
        }
    }

    // Timer
    gameState.matchTime -= dt / 1000;
    updateTimer();
    if (gameState.matchTime <= 0) {
        if      (gameState.gameMode === 'gemGrab')  endMatch(gameState.teamGems >= gameState.enemyGems);
        else if (gameState.gameMode === 'showdown') endMatch(true);
        else                                        endMatch(gameState.enemySafe.hp < gameState.safe.hp);
        return;
    }

    updateCamera();

    // Player health bar
    const hpPct = player.hp / player.maxHp;
    const hb    = document.getElementById('healthBar');
    hb.style.width      = Math.max(0, hpPct * 100) + '%';
    hb.style.background = hpPct > 0.5 ? 'linear-gradient(90deg,#00cc66,#00ff88)' :
                          hpPct > 0.25 ? 'linear-gradient(90deg,#cc8800,#ffd700)' :
                                         'linear-gradient(90deg,#cc0033,#ff3366)';

    // Passive healing
    [player, ...gameState.enemies].forEach(ent => {
        if (!ent || ent.hp <= 0) return;
        if (ent.flashTimer > 0) ent.flashTimer -= dt;
        if (ent.hp < ent.maxHp && (Date.now() - (ent.lastDamageTime || 0)) > 3000) {
            ent.hp = Math.min(ent.maxHp, ent.hp + ent.maxHp * 0.1 * (dt / 1000));
        }
    });

    updateAI(dt);
    updateParticles(dt);
    updateFloatingTexts(dt);
    updateDeathRings(dt);
    updateZones(dt);
    updateDyingEntities(dt);
    gameState.shakeAmount *= 0.88;
}

// ── Render ────────────────────────────────────────────────────────────────────

function render(p) {
    clear();
    if (!gameState.running || !gameState.player) return;

    // Screen shake
    if (gameState.shakeAmount > 0.5) {
        p.translate(
            p.random(-gameState.shakeAmount, gameState.shakeAmount),
            p.random(-gameState.shakeAmount, gameState.shakeAmount)
        );
    }

    beginCamera();

    drawWorld();
    if (gameState.gameMode === 'gemGrab') drawGemMine(mineRumble);
    gameState.zones.forEach(drawZone);
    drawGems();
    drawParticleEffects();
    gameState.deathRings.forEach(d => drawDeathRing(d));
    dyingEntities.forEach(de => drawDyingBrawler(de));
    drawBullets();

    // Z-sorted entity draw
    const queue = [];
    if (gameState.player && gameState.player.hp > 0) queue.push({ entity: gameState.player, isPlayer: true });
    gameState.enemies.forEach(e => { if (e.hp > 0) queue.push({ entity: e, isPlayer: false }); });
    queue.sort((a, b) => a.entity.y - b.entity.y);
    queue.forEach(item => drawBrawler(item.entity, item.isPlayer));

    gameState.floatingTexts.forEach(ft => drawFloatingText(ft));

    endCamera();

    // Screen-space overlays (drawn outside camera transform)
    drawGasVignette(gameState.player);
    drawMinimap();
    if (gameState.player && gameState.player.respawning > 0) drawRespawnOverlay(gameState.player);
}

// ── p5 Sketch ─────────────────────────────────────────────────────────────────

const sketch = (p) => {
    const IMGS = {};

    p.preload = () => {
        let loadedCount = 0;
        let totalAssets = 0;

        const tryLoad = (path, name) => {
            totalAssets++;
            const img = p.loadImage(path, (loaded) => {
                loadedCount++;
                const bar = document.getElementById('loadingBar');
                if (bar) bar.style.width = (loadedCount / totalAssets * 100) + '%';
                
                // Background removal
                if (!path.includes('floor')) {
                    _stripBackground(loaded);
                }
            }, () => {
                console.warn(`Failed to load: ${path}`);
                loadedCount++;
            });
            return img;
        };

        // Background Removal Helper (Chroma Key white/near-grey -> transparent)
        const _stripBackground = (img) => {
            img.loadPixels();
            for (let i = 0; i < img.pixels.length; i += 4) {
                const r = img.pixels[i];
                const g = img.pixels[i+1];
                const b = img.pixels[i+2];
                
                // Aggressive White/Grey Removal
                const brightness = (r + g + b) / 3;
                const maxC = Math.max(r, g, b);
                const minC = Math.min(r, g, b);
                const saturation = maxC - minC;
                
                // 1. Pure or Near-White (catches JPG artifacts)
                const isWhite = brightness > 238;
                // 2. Bright Neutral Grey (common in some sprite backgrounds)
                const isNeutral = brightness > 210 && saturation < 25;
                
                if (isWhite || isNeutral) {
                    img.pixels[i+3] = 0;
                }
            }
            img.updatePixels();
        };

        // ── Biome Tiles ──
        Object.values(BIOMES).forEach(biome => {
            IMGS[`${biome.id}_floor`] = tryLoad(biome.floor);
            IMGS[`${biome.id}_wall`]  = tryLoad(biome.wall);
            IMGS[`${biome.id}_bush`]  = tryLoad(biome.bush);
        });

        // Set default pointers for backward compatibility
        IMGS.floor = IMGS.grassland_floor;
        IMGS.wall  = IMGS.grassland_wall;
        IMGS.bush  = IMGS.grassland_bush;
        
        IMGS.environment = tryLoad('assets/environment.png');
        IMGS.safe_blue   = tryLoad('assets/safe_blue.png');
        IMGS.safe_red    = tryLoad('assets/safe_red.png');
        
        // ── Brawler & Skin Sprites ──
        Object.values(BRAWLERS).forEach(b => {
            if (b.image) {
                IMGS[b.id] = tryLoad(b.image);
            }
            if (b.skins) {
                b.skins.forEach(skin => {
                    const key = (skin.id === 'default') ? b.id : `${b.id}_${skin.id}`;
                    IMGS[key] = tryLoad(skin.image);
                });
            }
        });
    };

    p.setup = () => {
        const cnv = p.createCanvas(p.windowWidth, p.windowHeight);
        cnv.parent('gameCanvas');
        p.angleMode(p.RADIANS);
        p.textFont('Roboto');
        p.imageMode(p.CORNER);

        initRenderer(p, IMGS);
        setupInputHandlers();
        initAudio();
        renderBrawlerSelect();
        showScreen('landing');

        window.brawlGame = {
            input,
            showScreen,
            selectBrawler: (id) => {
                gameState.selectedBrawler = id;
                populateSkinGrid(BRAWLERS[id]);
                showScreen('skinSelect');
                showMenuBrawlerPreview();
            },
            confirmBrawlerSelection: () => {
                showScreen('modeSelect');
                showMenuBrawlerPreview();
            },
            selectSkin: (skinId) => {
                gameState.selectedSkin = skinId;
                showScreen('modeSelect');
                showMenuBrawlerPreview();
            },
            selectMode,
            startGame,
            returnToMenu,
            retryMatch,
            openProfile,
            openLeaderboard,
            togglePauseMenu,
            quitMatch,
            showTrophyRoad,
            claimBrawler,
            toggleMusic,
            toggleSFX,
            updateUIScale,
            claimQuest,
            upgradeBrawler
        };

        loadProfile();
        
        // Hide loading and show menu
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 500);
            }
            showMenuBrawlerPreview();
            playMusic('menu');
        }, 800);
    };

    p.draw = () => {
        const dt = Math.min(p.deltaTime, 50);
        if (!gameState.paused) update(dt);
        render(p);
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    // Mouse aim — fires on move AND drag
    p.mouseMoved = () => {
        if (gameState.running) setMouseAim(p.mouseX + gameState.camera.x, p.mouseY + gameState.camera.y);
    };
    p.mouseDragged = () => {
        if (gameState.running) setMouseAim(p.mouseX + gameState.camera.x, p.mouseY + gameState.camera.y);
    };

    p.mousePressed = () => {
        if (gameState.running) input.shooting = true;
    };
    p.mouseReleased = () => {
        input.shooting = false;
    };
};

// Kick off — p5 is loaded as a global before this module
new p5(sketch); // eslint-disable-line no-undef
