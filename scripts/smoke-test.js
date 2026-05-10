const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createClassList() {
  const set = new Set();
  return {
    add: (...names) => names.forEach(name => set.add(name)),
    remove: (...names) => names.forEach(name => set.delete(name)),
    toggle: (name, force) => {
      if (force === undefined) {
        if (set.has(name)) {
          set.delete(name);
          return false;
        }
        set.add(name);
        return true;
      }
      if (force) set.add(name);
      else set.delete(name);
      return !!force;
    },
    contains: name => set.has(name)
  };
}

function createElement(id = '') {
  return {
    id,
    style: {},
    dataset: {},
    children: [],
    textContent: '',
    innerHTML: '',
    value: '',
    src: '',
    width: 0,
    height: 0,
    classList: createClassList(),
    appendChild(child) { this.children.push(child); return child; },
    addEventListener() {},
    removeEventListener() {},
    setAttribute(name, value) { this[name] = value; },
    getContext() { return globalCtx; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 1280, height: 720 }; },
    querySelectorAll() { return []; },
    querySelector() { return null; }
  };
}

const ctxProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
      return () => ({ addColorStop() {} });
    }
    if (prop === 'measureText') return () => ({ width: 100 });
    if (!(prop in target)) target[prop] = () => {};
    return target[prop];
  },
  set(target, prop, value) {
    target[prop] = value;
    return true;
  }
});
const globalCtx = ctxProxy;

class FakeImage {
  constructor() { this.src = ''; }
}
class FakeAudioContext {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  createOscillator() { return { connect() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, type: 'sine', start() {}, stop() {} }; }
  createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
  createBiquadFilter() { return { connect() {}, frequency: { value: 0 } }; }
  resume() { this.state = 'running'; }
}

function createEnvironment() {
  const elements = new Map();
  const defaultIds = [
    'gameCanvas','modeSelectScreen','currencyBar','gameUI','gemHud','showdownHud','heistHud','superIcon','healthBar',
    'playersLeft','teamGems','enemyGems','playerSafeHealth','enemySafeHealth','coinDisplay','trophyDisplay',
    'gemCurrencyDisplay','brawlerThumbnails','characterCard','characterCardOverlay','joystickZone','joystickKnob',
    'attackButton','superButton','gadgetButton','victoryScreen','defeatScreen','victoryCoins','victoryTrophies',
    'defeatCoins','defeatTrophies','questPanel','brawlerSelectScreen'
  ];
  defaultIds.forEach(id => elements.set(id, createElement(id)));
  elements.get('gameCanvas').width = 1280;
  elements.get('gameCanvas').height = 720;

  const timerspan = createElement('timerSpan');
  const modeCards = ['gemGrab','showdown','heist'].map(mode => {
    const el = createElement();
    el.dataset.mode = mode;
    return el;
  });
  const ammoSlots = Array.from({ length: 3 }, () => createElement());

  const document = {
    body: createElement('body'),
    createElement: tag => createElement(tag),
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElement(id));
      return elements.get(id);
    },
    querySelector(selector) {
      if (selector === '.match-timer span') return timerspan;
      const modeMatch = selector.match(/^\[data-mode="(.+)"\]$/);
      if (modeMatch) return modeCards.find(card => card.dataset.mode === modeMatch[1]) || null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '.mode-card') return modeCards;
      if (selector === '.ammo-slot') return ammoSlots;
      return [];
    },
    addEventListener() {},
    removeEventListener() {}
  };
  document.body.appendChild = child => child;

  const localStorageStore = new Map();
  const localStorage = {
    getItem: key => localStorageStore.has(key) ? localStorageStore.get(key) : null,
    setItem: (key, value) => localStorageStore.set(key, String(value)),
    removeItem: key => localStorageStore.delete(key)
  };

  const context = {
    console,
    Math,
    Date,
    JSON,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    performance: { now: () => Date.now() },
    window: null,
    document,
    localStorage,
    Image: FakeImage,
    AudioContext: FakeAudioContext,
    webkitAudioContext: FakeAudioContext,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    innerWidth: 1280,
    innerHeight: 720,
    CanvasRenderingContext2D: function CanvasRenderingContext2D() {},
    navigator: { userAgent: 'node' }
  };
  context.window = context;
  context.window.addEventListener = () => {};
  context.window.removeEventListener = () => {};
  context.window.innerWidth = 1280;
  context.window.innerHeight = 720;
  context.window.localStorage = localStorage;
  context.window.document = document;
  context.CanvasRenderingContext2D.prototype = {};
  return { context, document, elements, timerspan };
}

function extractScript(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const matches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (!matches.length) throw new Error(`No inline script found in ${htmlPath}`);
  return matches.map(match => match[1]).join('\n');
}

function runScenario(htmlPath, mode, brawlerId) {
  const { context } = createEnvironment();
  const script = extractScript(htmlPath);
  const harness = `
${script}
this.__smoke = {
  getState: () => gameState,
  select: (mode, brawlerId) => {
    gameState.selectedBrawler = brawlerId;
    gameState.gameMode = mode;
    startGame();
  },
  update: dt => update(dt),
  activateGadget: () => activateGadget(),
  activateSuper: () => activateSuper(),
  getAutoAimAngle: () => getAutoAimAngle(),
  setEnemyNearPlayer: () => {
    if (!gameState.enemies.length) throw new Error('No enemies spawned');
    const enemy = gameState.enemies[0];
    enemy.x = gameState.player.x + 110;
    enemy.y = gameState.player.y;
    enemy.invulnerable = 0;
    enemy.hp = Math.max(enemy.hp, 1200);
    return enemy.hp;
  },
  setEnemyOnSafe: () => {
    if (!gameState.enemies.length) throw new Error('No enemies spawned');
    const enemy = gameState.enemies[0];
    enemy.x = gameState.safe.x + 30;
    enemy.y = gameState.safe.y;
    enemy.lastDamagedAt = 0;
    enemy.aggression = 2.5;
    gameState.player.x = gameState.enemySafe.x;
    gameState.player.y = gameState.enemySafe.y;
    return gameState.safe.hp;
  },
  forceEnemyGemDrop: () => {
    if (!gameState.enemies.length) throw new Error('No enemies spawned');
    const before = gameState.gems.length;
    const enemy = gameState.enemies[0];
    enemy.gems = 2;
    enemy.invulnerable = 0;
    enemy.hp = 50;
    damageEnemy(enemy, 100, { ignoreInvulnerable: true, silentHit: true, rewardSuper: false });
    return gameState.gems.length - before;
  },
  testGemCountdown: () => {
    gameState.teamGems = 10;
    updateGemDisplay();
    update(250);
    if (!gameState.gemCountdown) throw new Error('Gem countdown did not start');
    const before = gameState.gemCountdown.timeLeft;
    update(1000);
    if (!(gameState.gemCountdown.timeLeft < before)) throw new Error('Gem countdown did not tick down');
    return Math.ceil(gameState.gemCountdown.timeLeft);
  },
  testEnemyCountdownBreak: () => {
    gameState.gemCountdown = null;
    gameState.enemyGems = 10;
    gameState.teamGems = 4;
    updateGemDisplay();
    update(250);
    if (!gameState.gemCountdown || gameState.gemCountdown.owner !== 'enemy') throw new Error('Enemy countdown did not start');
    gameState.enemyGems = 8;
    updateGemDisplay();
    update(250);
    if (gameState.gemCountdown) throw new Error('Enemy countdown did not break');
    return true;
  },
  testGemEscortIntent: () => {
    if (gameState.enemies.length < 2) throw new Error('Need at least two enemies for escort intent test');
    const [carrier, escort] = gameState.enemies;
    gameState.gemCountdown = { owner: 'enemy', timeLeft: 12 };
    gameState.enemyGems = 10;
    gameState.teamGems = 6;
    carrier.gems = 6;
    escort.gems = 0;
    carrier.x = 2800;
    carrier.y = 1200;
    escort.x = 2500;
    escort.y = 1200;
    gameState.player.gems = 5;
    gameState.player.x = 2350;
    gameState.player.y = 1200;
    const carrierIntent = getEnemyIntent(carrier, Date.now(), gameState.player);
    const escortIntent = getEnemyIntent(escort, Date.now(), gameState.player);
    if (carrierIntent.focus !== 'retreatGemLead') throw new Error('Carrier did not retreat with lead (' + carrierIntent.focus + ')');
    if (escortIntent.focus !== 'escortCarrier') throw new Error('Support bot did not escort lead (' + escortIntent.focus + ')');
    return true;
  }
};`;
  vm.createContext(context);
  vm.runInContext(harness, context, { timeout: 5000, filename: path.basename(htmlPath) });
  context.__smoke.select(mode, brawlerId);
  const state = context.__smoke.getState();
  if (!state.running) throw new Error(`${mode}/${brawlerId}: game did not start`);
  if (!state.player || !state.enemies.length) throw new Error(`${mode}/${brawlerId}: missing player or enemies`);
  const enemyHpBefore = context.__smoke.setEnemyNearPlayer();
  context.__smoke.update(16);
  context.__smoke.activateGadget();
  context.__smoke.update(250);
  context.__smoke.activateSuper();
  context.__smoke.update(250);
  const enemyHpAfter = state.enemies[0] ? state.enemies[0].hp : 0;
  if (enemyHpAfter >= enemyHpBefore && state.enemies.length > 0) throw new Error(`${mode}/${brawlerId}: enemy did not take damage during combat flow`);
  if (state.player.x < state.player.radius || state.player.y < state.player.radius) throw new Error(`${mode}/${brawlerId}: player left arena bounds`);
  if (state.player.x > 4200 - state.player.radius || state.player.y > 2600 - state.player.radius) throw new Error(`${mode}/${brawlerId}: player left arena bounds`);
  if (Number.isNaN(state.player.hp) || Number.isNaN(state.matchTime)) throw new Error(`${mode}/${brawlerId}: invalid numeric state`);
  let safeDelta = 0;
  let countdownLeft = 0;
  if (mode === 'heist') {
    const safeBefore = context.__smoke.setEnemyOnSafe();
    for (let i = 0; i < 60; i++) context.__smoke.update(250);
    safeDelta = safeBefore - state.safe.hp;
    if (safeDelta <= 0) throw new Error(`${mode}/${brawlerId}: safe did not take pressure damage`);
  }
  let gemDrops = 0;
  let enemyCountdownBreak = false;
  let escortIntentOk = false;
  if (mode === 'gemGrab') {
    gemDrops = context.__smoke.forceEnemyGemDrop();
    if (gemDrops < 2) throw new Error(`${mode}/${brawlerId}: gem drop behavior failed`);
    countdownLeft = context.__smoke.testGemCountdown();
    enemyCountdownBreak = context.__smoke.testEnemyCountdownBreak();
    escortIntentOk = context.__smoke.testGemEscortIntent();
  }
  return {
    mode,
    brawlerId,
    enemies: state.enemies.length,
    effects: state.effects.length,
    bullets: state.bullets.length,
    hp: state.player.hp,
    safeDelta,
    gemDrops,
    countdownLeft,
    enemyCountdownBreak,
    escortIntentOk
  };
}

const htmlPath = path.resolve(process.argv[2] || 'projects/noah-brawl-stars/src/index.html');
const scenarios = [
  ['gemGrab', 'bear'],
  ['showdown', 'caveman'],
  ['heist', 'eagle']
];
for (const [mode, brawlerId] of scenarios) {
  const result = runScenario(htmlPath, mode, brawlerId);
  console.log(`Smoke OK ${result.mode}/${result.brawlerId} enemies=${result.enemies} effects=${result.effects} bullets=${result.bullets} hp=${Math.round(result.hp)} safeDelta=${Math.round(result.safeDelta || 0)} gemDrops=${result.gemDrops || 0} countdownLeft=${result.countdownLeft || 0} enemyCountdownBreak=${result.enemyCountdownBreak ? 'yes' : 'no'} escortIntent=${result.escortIntentOk ? 'yes' : 'no'}`);
}
