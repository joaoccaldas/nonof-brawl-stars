/**
 * config.js - Game configuration and constants
 * 
 * All game constants, brawler definitions, and mode settings
 */

// World settings
export const CONFIG = {
    WORLD_WIDTH: 3200,
    WORLD_HEIGHT: 3200,
    PLAYER_RADIUS: 35,
    ENEMY_RADIUS: 32,
    BULLET_RADIUS: 8,
    GEM_RADIUS: 25,
    SAFE_RADIUS: 60,
    MAX_GEMS: 10
};

export const BIOMES = {
    grassland: {
        id: 'grassland',
        name: 'Grassland',
        floor: 'assets/floor_tile.png',
        wall: 'assets/wall_tile.png',
        bush: 'assets/bush_tile.png'
    },
    desert: {
        id: 'desert',
        name: 'Desert',
        floor: 'tiles/floor_sand.png',
        wall: 'tiles/wall_adobe.png',
        bush: 'tiles/bush_cactus.png'
    },
    cyber: {
        id: 'cyber',
        name: 'Cyber City',
        floor: 'tiles/floor_tech.png',
        wall: 'tiles/wall_circuit.png',
        bush: 'tiles/bush_hologram.png'
    }
};

// Brawler definitions
export const BRAWLERS = {
    bear: {
        id: 'bear',
        name: 'Solar Paws',
        image: 'sprites/bear_brawler.jpg',
        skins: [
            { id: 'default', name: 'Original', image: 'sprites/bear_brawler.jpg' },
            { id: 'polar', name: 'Polar Bear', image: 'sprites/bear_polar.png' }
        ],
        hp: 3600,
        speed: 720,
        damage: 320,
        shotCount: 3,
        spread: 0.3,
        range: 6.5,
        reload: 1.6,
        maxAmmo: 3,
        superName: 'Solar Blast',
        superDesc: 'Unleashes a powerful solar explosion',
        superDamage: 1400,
        superRange: 8,
        breaksWalls: true,
        color: '#ffaa00',
        rarity: 'starting',
        particleType: 'star',
        unlocked: true,
        unlockTrophies: 0
    },
    caveman: {
        id: 'caveman',
        name: 'Punk Bonker',
        image: 'sprites/caveman_brawler.jpg',
        skins: [
            { id: 'default', name: 'Original', image: 'sprites/caveman_brawler.jpg' },
            { id: 'gold', name: 'Golden Clubba', image: 'sprites/caveman_gold.png' }
        ],
        hp: 4200,
        speed: 650,
        damage: 220,
        shotCount: 5,
        spread: 0.7,
        range: 5.5,
        reload: 1.8,
        maxAmmo: 3,
        superName: 'Primal Rage',
        superDesc: 'Increases speed and damage for 5 seconds',
        superDamage: 1600,
        superRange: 6,
        color: '#8B4513',
        rarity: 'starting',
        particleType: 'square',
        unlocked: false,
        unlockTrophies: 50
    },
    eagle: {
        id: 'eagle',
        name: 'Aviator Ace',
        image: 'sprites/eagle_brawler.jpg',
        skins: [
            { id: 'default', name: 'Original', image: 'sprites/eagle_brawler.jpg' },
            { id: 'cyber', name: 'Cyber Eagle', image: 'sprites/eagle_cyber.png' }
        ],
        hp: 3200,
        speed: 780,
        damage: 900,
        shotCount: 1,
        spread: 0,
        range: 9.5,
        reload: 1.4,
        maxAmmo: 3,
        superName: 'Eagle Strike',
        superDesc: 'Fires piercing shots that hit multiple enemies',
        superDamage: 1200,
        superRange: 12,
        color: '#4169E1',
        rarity: 'rare',
        particleType: 'star',
        unlocked: false,
        unlockTrophies: 150
    },
    bombardier: {
        id: 'bombardier',
        name: 'Blast King',
        image: 'sprites/bombardier_brawler.jpg',
        skins: [
            { id: 'default', name: 'Original', image: 'sprites/bombardier_brawler.jpg' }
        ],
        hp: 3000,
        speed: 700,
        damage: 1000,
        shotCount: 1,
        spread: 0,
        range: 7,
        reload: 2.0,
        maxAmmo: 3,
        isThrower: true,
        aoeRadius: 100,
        superName: 'Big One',
        superDesc: 'Massive bomb with huge AOE damage',
        superDamage: 2200,
        superRange: 8,
        color: '#ff4400',
        rarity: 'rare',
        particleType: 'square',
        unlocked: false,
        unlockTrophies: 500
    },
    medic: {
        id: 'medic',
        name: 'Bio-Healer',
        image: 'sprites/medic_brawler.jpg',
        hp: 3800,
        speed: 720,
        damage: 600,
        range: 6,
        reload: 1.5,
        maxAmmo: 3,
        superName: 'Healing Mist',
        superDesc: 'Restores 30% HP instantly',
        superDamage: 0,
        superRange: 5,
        color: '#00ff88',
        rarity: 'super_rare',
        particleType: 'leaf',
        unlocked: false,
        unlockTrophies: 1000
    },
    hex: {
        id: 'hex',
        name: 'Shadow DJ',
        image: 'sprites/hex_brawler.jpg',
        hp: 2600,
        speed: 820,
        damage: 600,
        range: 8.5,
        reload: 2.0,
        maxAmmo: 3,
        superName: 'Witch Hex',
        superDesc: 'Releases 10 toxic bolts in all directions',
        superDamage: 900,
        superRange: 9,
        color: '#9932CC',
        rarity: 'rare',
        particleType: 'note',
        unlocked: false,
        unlockTrophies: 4000
    },
    ironclad: {
        id: 'ironclad',
        name: 'Mecha-Unit',
        image: 'sprites/ironclad_brawler.jpg',
        hp: 6500,
        speed: 480,
        damage: 1400,
        range: 3.5,
        reload: 2.8,
        maxAmmo: 2,
        superName: 'Armored Charge',
        superDesc: 'Fires 3 devastating blasts with massive knockback',
        superDamage: 2200,
        superRange: 5,
        breaksWalls: true,
        color: '#708090',
        rarity: 'rare',
        particleType: 'hex',
        unlocked: false,
        unlockTrophies: 3000
    },
    blade: {
        id: 'blade',
        name: 'Cyber Ninja',
        image: 'sprites/blade_brawler.jpg',
        hp: 3000,
        speed: 950,
        damage: 500,
        range: 5.5,
        reload: 1.1,
        maxAmmo: 4,
        superName: 'Shadow Storm',
        superDesc: 'Throws 5 rapid shurikens in a fan pattern',
        superDamage: 800,
        superRange: 7,
        color: '#00FFAA',
        rarity: 'rare',
        particleType: 'star',
        unlocked: false,
        unlockTrophies: 2000
    },
    archer: {
        id: 'archer',
        name: 'Hooded Gamer',
        image: 'sprites/archer_brawler.jpg',
        hp: 3000,
        speed: 720,
        damage: 650,
        range: 11.0,
        reload: 1.6,
        maxAmmo: 3,
        superName: 'Arrow Rain',
        superDesc: 'Fires 8 arrows in a wide arc',
        superDamage: 800,
        superRange: 13,
        color: '#228B22',
        rarity: 'starting',
        particleType: 'leaf',
        unlocked: true
    }
};

// Game modes
export const GAME_MODES = {
    gemGrab: {
        id: 'gemGrab',
        name: 'Gem Grab',
        description: 'Collect 10 gems and hold them',
        time: 120,
        maxGems: 10,
        biome: 'grassland'
    },
    showdown: {
        id: 'showdown',
        name: 'Showdown',
        description: 'Battle Royale - last one standing wins',
        time: 180,
        players: 10,
        biome: 'desert'
    },
    heist: {
        id: 'heist',
        name: 'Heist',
        description: 'Destroy the enemy safe',
        time: 120,
        biome: 'cyber'
    }
};
