import sys

with open('build/main.js', 'r') as f:
    lines = f.readlines()

# Find the first startGame
start_idx = -1
for i, line in enumerate(lines):
    if 'function startGame() {' in line:
        start_idx = i
        break

# Find the endMatch
end_idx = -1
for i, line in enumerate(lines):
    if 'function endMatch(victory)' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_content = """function startGame() {
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
    updateHUD();
    gameState.running = true;
}

function showMenuBrawlerPreview() {
    const brawler = BRAWLERS[gameState.selectedBrawler || 'bear'];
    const preview = document.getElementById('menuBrawlerPreview');
    if (preview && brawler) {
        const skin = gameState.selectedSkin || 'default';
        const imgPath = skin === 'default' ? brawler.image : (brawler.skins.find(s=>s.id===skin)?.image || brawler.image);
        preview.innerHTML = `<img src="/${imgPath}" style="width:100%; height:100%; object-fit:contain;">`;
    }
}

"""
    # Replace the entire block from the first startGame to just before endMatch
    lines[start_idx:end_idx] = [new_content]
    with open('build/main.js', 'w') as f:
        f.writelines(lines)
    print("Fixed!")
else:
    print(f"Indices not found: {start_idx}, {end_idx}")
