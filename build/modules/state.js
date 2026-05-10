/**
 * state.js - Game state management
 * 
 * Centralized game state with initialization functions
 * Imports: config.js for brawler/base data
 */

import { CONFIG, BRAWLERS } from './config.js';

// Main game state object
export const gameState = {
    // Currency
    coins: 100,
    trophies: 0,
    quests: [],
    sessionStats: { damage: 0, kills: 0, wins: 0 },
    brawlerLevels: {}, // { bear: 1, caveman: 1, ... }
    
    // Selection
    selectedBrawler: null,
    gameMode: 'gemGrab',
    
    // Game loop
    running: false,
    
    // Entities
    player: null,
    enemies: [],
    bullets: [],
    gems: [],
    walls: [],
    bushes: [],
    waterTiles: [],
    jumpPads: [],
    
    // Mode-specific objects
    safe: { x: 0, y: 0, hp: 10000, maxHp: 10000 },
    enemySafe: { x: 0, y: 0, hp: 10000, maxHp: 10000 },
    
    // Camera
    camera: { x: 0, y: 0, zoom: 1, targetZoom: 1 },
    
    // Mode state
    teamGems: 0,
    enemyGems: 0,
    matchTime: 120,
    playersLeft: 10,
    gasRadius: 1600,
    gasDamage: 50,
    
    // Transient match state
    particles: [],
    floatingTexts: [],
    deathRings: [],
    zones: [],
    ammoCrates: [],
    shakeAmount: 0
};

/**
 * Initialize the player based on selected brawler
 * @param {string} brawlerId - The brawler ID
 * @returns {Object} Player object
 */
export function initPlayer(brawlerId) {
    const brawler = BRAWLERS[brawlerId];
    if (!brawler) return null;
    
    const level = gameState.brawlerLevels[brawlerId] || 1;
    const multiplier = 1 + (level - 1) * 0.05;
    const scaledHp = Math.floor(brawler.hp * multiplier);
    
    gameState.player = {
        x: CONFIG.WORLD_WIDTH / 2,
        y: CONFIG.WORLD_HEIGHT / 2,
        vx: 0, vy: 0,
        angle: 0,
        currentAngle: 0,
        radius: CONFIG.PLAYER_RADIUS,
        hp: scaledHp,
        maxHp: scaledHp,
        damage: Math.floor(brawler.damage * multiplier),
        superDamage: Math.floor((brawler.superDamage || 1000) * multiplier),
        ammo: brawler.maxAmmo || 3,
        lastShot: 0,
        superCharge: 0,
        brawler: brawler,
        level: level,
        team: gameState.gameMode === 'showdown' ? 'player' : 'blue',
        gems: 0,
        powerCubes: 0,
        invulnerable: 0,
        flashTimer: 0,
        revealedTimer: 0,
        inBush: false,
        walkFrame: 0,
        rageActive: false,
        rageEndTime: 0
    };
    
    gameState.camera = { x: 0, y: 0, targetX: 0, targetY: 0, zoom: 1, targetZoom: 1 };
    return gameState.player;
}

/**
 * Reset game state for a new match
 * @param {string} mode - Game mode ID
 */
export function resetGameState(mode = 'gemGrab') {
    gameState.running = false;
    gameState.paused = false;
    gameState.matchTime = mode === 'showdown' ? 180 : 120;
    gameState.bullets = [];
    gameState.enemies = [];
    gameState.walls = [];
    gameState.bushes = [];
    gameState.gems = [];
    gameState.powerCubes = [];
    gameState.teamGems = 0;
    gameState.enemyGems = 0;
    gameState.playersLeft = 10;
    gameState.gasRadius = 1600;
    gameState.camera = { x: 0, y: 0, targetX: 0, targetY: 0, zoom: 1, targetZoom: 1 };
    gameState.particles = [];
    gameState.floatingTexts = [];
    gameState.deathRings = [];
    gameState.zones = [];
    gameState.ammoCrates = [];
    gameState.waterTiles = [];
    gameState.jumpPads = [];
    gameState.shakeAmount = 0;
}

/**
 * Set up heist mode safes
 */
export function setupHeist() {
    gameState.safe = { 
        x: CONFIG.WORLD_WIDTH / 2 - 600, 
        y: CONFIG.WORLD_HEIGHT / 2, 
        hp: 10000, 
        maxHp: 10000 
    };
    gameState.enemySafe = { 
        x: CONFIG.WORLD_WIDTH / 2 + 600, 
        y: CONFIG.WORLD_HEIGHT / 2, 
        hp: 10000, 
        maxHp: 10000 
    };
}

/**
 * Update currency display in UI
 */
export function updateCurrencyDisplay() {
    const coinDisplay = document.getElementById('coinDisplay');
    const trophyDisplay = document.getElementById('trophyDisplay');
    if (coinDisplay) coinDisplay.textContent = gameState.coins;
    if (trophyDisplay) trophyDisplay.textContent = gameState.trophies;
}

/**
 * Setup mode-specific UI elements
 */
export function setupModeUI() {
    const gemHud = document.getElementById('gemHud');
    const showdownHud = document.getElementById('showdownHud');
    const heistHud = document.getElementById('heistHud');
    
    if (gemHud) gemHud.classList.add('hidden');
    if (showdownHud) showdownHud.classList.add('hidden');
    if (heistHud) heistHud.classList.add('hidden');
    
    if (gameState.gameMode === 'gemGrab' && gemHud) {
        gemHud.classList.remove('hidden');
    } else if (gameState.gameMode === 'showdown' && showdownHud) {
        showdownHud.classList.remove('hidden');
    } else if (gameState.gameMode === 'heist' && heistHud) {
        heistHud.classList.remove('hidden');
    }
}
