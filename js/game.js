(() => {
  'use strict';

  // ---------- Constants ----------
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const VIEW_W = canvas.width;
  const VIEW_H = canvas.height;

  const GRAVITY = 1400;
  const JUMP_VELOCITY = -620;
  const MOVE_SPEED = 240;
  const MAX_FALL_SPEED = 900;
  const PLAYER_W = 30;
  const PLAYER_H = 40;
  const ENEMY_W = 32;
  const ENEMY_H = 32;
  const COIN_RADIUS = 8;
  const INVULN_TIME = 1.4;
  const START_LIVES = 3;
  const HIGHSCORE_KEY = 'pixelquest_highscore';

  const THEMES = {
    forest: { sky1: '#87ceeb', sky2: '#c9f0ff', ground: '#5b3a29', groundTop: '#3f9142', platform: '#7a5230', hill: '#3a7d3f' },
    cave: { sky1: '#1c1730', sky2: '#3a2f5c', ground: '#3d3550', groundTop: '#5a4d78', platform: '#4a3f66', hill: '#241e3a' },
    tower: { sky1: '#2b1b3d', sky2: '#6b3fa0', ground: '#4a2f5c', groundTop: '#8855aa', platform: '#5c3d70', hill: '#33224a' }
  };

  // ---------- DOM references ----------
  const hudScore = document.getElementById('hud-score');
  const hudLevel = document.getElementById('hud-level');
  const hudLives = document.getElementById('hud-lives');
  const screens = {
    start: document.getElementById('screen-start'),
    pause: document.getElementById('screen-pause'),
    levelComplete: document.getElementById('screen-level-complete'),
    gameover: document.getElementById('screen-gameover'),
    win: document.getElementById('screen-win')
  };
  const highscoreLabel = document.getElementById('highscore-label');
  const levelCompleteScore = document.getElementById('level-complete-score');
  const gameoverScore = document.getElementById('gameover-score');
  const winScore = document.getElementById('win-score');

  // ---------- Game state ----------
  let state = 'start'; // start | playing | paused | levelcomplete | gameover | win
  let levelIndex = 0;
  let level = null;
  let coins = [];
  let enemies = [];
  let score = 0;
  let lives = START_LIVES;
  let cameraX = 0;
  let elapsed = 0;

  const player = {
    x: 0, y: 0, w: PLAYER_W, h: PLAYER_H,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    invuln: 0
  };

  const keys = { left: false, right: false, jumpHeld: false };

  // ---------- Helpers ----------
  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle('hidden', key !== name);
    });
  }

  function hideAllScreens() {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
  }

  function getHighscore() {
    return Number(localStorage.getItem(HIGHSCORE_KEY) || 0);
  }

  function setHighscoreIfNeeded(finalScore) {
    const current = getHighscore();
    if (finalScore > current) {
      localStorage.setItem(HIGHSCORE_KEY, String(finalScore));
      return true;
    }
    return false;
  }

  // ---------- Level management ----------
  function loadLevel(index) {
    levelIndex = index;
    const src = LEVELS[index];
    level = src;
    coins = src.coins.map(c => ({ x: c.x, y: c.y, collected: false }));
    enemies = src.enemies.map(e => ({
      x: e.x, y: e.y, w: ENEMY_W, h: ENEMY_H,
      minX: e.minX, maxX: e.maxX,
      speed: Math.abs(e.speed),
      dir: e.speed < 0 ? -1 : 1,
      alive: true
    }));
    respawnPlayer();
    cameraX = clamp(player.x - VIEW_W / 2, 0, Math.max(0, level.worldWidth - VIEW_W));
    hudLevel.textContent = level.name;
  }

  function respawnPlayer() {
    player.x = level.playerStart.x;
    player.y = level.playerStart.y;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.invuln = INVULN_TIME * 0.5;
  }

  function loseLife() {
    lives = Math.max(0, lives - 1);
    updateHud();
    SFX.hurt();
    if (lives <= 0) {
      gameOver();
    } else {
      respawnPlayer();
    }
  }

  function gameOver() {
    state = 'gameover';
    const isHigh = setHighscoreIfNeeded(score);
    gameoverScore.textContent = `Score final : ${score}` + (isHigh ? '  —  Nouveau record !' : `  (Record : ${getHighscore()})`);
    SFX.gameover();
    showScreen('gameover');
  }

  function levelComplete() {
    SFX.goal();
    if (levelIndex >= LEVELS.length - 1) {
      state = 'win';
      const isHigh = setHighscoreIfNeeded(score);
      winScore.textContent = `Score final : ${score}` + (isHigh ? '  —  Nouveau record !' : `  (Record : ${getHighscore()})`);
      SFX.win();
      showScreen('win');
    } else {
      state = 'levelcomplete';
      levelCompleteScore.textContent = `Score actuel : ${score}`;
      showScreen('levelcomplete');
    }
  }

  function startGame() {
    score = 0;
    lives = START_LIVES;
    updateHud();
    loadLevel(0);
    state = 'playing';
    hideAllScreens();
  }

  function nextLevel() {
    loadLevel(levelIndex + 1);
    state = 'playing';
    hideAllScreens();
  }

  // ---------- HUD ----------
  function updateHud() {
    hudScore.textContent = `Score: ${score}`;
    hudLives.innerHTML = '';
    for (let i = 0; i < START_LIVES; i++) {
      const span = document.createElement('span');
      span.className = 'heart' + (i < lives ? '' : ' empty');
      span.textContent = '❤';
      hudLives.appendChild(span);
    }
  }

  // ---------- Input ----------
  function tryJump() {
    if (state !== 'playing') return;
    if (player.onGround) {
      player.vy = JUMP_VELOCITY;
      player.onGround = false;
      SFX.jump();
    }
  }

  window.addEventListener('keydown', (e) => {
    SFX.resume();
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
      case 'KeyQ':
        keys.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        keys.right = true;
        break;
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
      case 'KeyZ':
        if (!keys.jumpHeld) tryJump();
        keys.jumpHeld = true;
        e.preventDefault();
        break;
      case 'KeyP':
        togglePause();
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
      case 'KeyQ':
        keys.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        keys.right = false;
        break;
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
      case 'KeyZ':
        keys.jumpHeld = false;
        break;
    }
  });

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      showScreen('pause');
    } else if (state === 'paused') {
      state = 'playing';
      hideAllScreens();
    }
  }

  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-resume').addEventListener('click', togglePause);
  document.getElementById('btn-next-level').addEventListener('click', nextLevel);
  document.getElementById('btn-retry').addEventListener('click', startGame);
  document.getElementById('btn-play-again').addEventListener('click', startGame);

  // ---------- Physics / collision ----------
  function moveAndCollide(entity, dx, dy, platforms) {
    entity.x += dx;
    for (const p of platforms) {
      if (aabb(entity, p)) {
        if (dx > 0) entity.x = p.x - entity.w;
        else if (dx < 0) entity.x = p.x + p.w;
      }
    }

    entity.onGround = false;
    entity.y += dy;
    for (const p of platforms) {
      if (aabb(entity, p)) {
        if (dy > 0) {
          entity.y = p.y - entity.h;
          entity.onGround = true;
          entity.vy = 0;
        } else if (dy < 0) {
          entity.y = p.y + p.h;
          entity.vy = 0;
        }
      }
    }
  }

  function updatePlayer(dt) {
    // horizontal input
    let moveDir = 0;
    if (keys.left) moveDir -= 1;
    if (keys.right) moveDir += 1;
    player.vx = moveDir * MOVE_SPEED;
    if (moveDir !== 0) player.facing = moveDir;

    // gravity
    player.vy = clamp(player.vy + GRAVITY * dt, -Infinity, MAX_FALL_SPEED);

    moveAndCollide(player, player.vx * dt, player.vy * dt, level.platforms);

    if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);

    // fell into a pit
    if (player.y > FALL_Y) {
      loseLife();
      return;
    }

    // coins
    for (const coin of coins) {
      if (coin.collected) continue;
      const cx = coin.x, cy = coin.y;
      const px = clamp(cx, player.x, player.x + player.w);
      const py = clamp(cy, player.y, player.y + player.h);
      const dist = Math.hypot(cx - px, cy - py);
      if (dist < COIN_RADIUS + 4) {
        coin.collected = true;
        score += 10;
        SFX.coin();
        updateHud();
      }
    }

    // enemies
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (aabb(player, enemy)) {
        const stomp = player.vy > 0 && (player.y + player.h) - enemy.y < 18;
        if (stomp) {
          enemy.alive = false;
          player.vy = JUMP_VELOCITY * 0.55;
          score += 100;
          SFX.stomp();
          updateHud();
        } else if (player.invuln <= 0) {
          player.invuln = INVULN_TIME;
          player.vx = -player.facing * 180;
          player.vy = -260;
          loseLife();
        }
      }
    }

    // goal
    if (aabb(player, level.goal)) {
      levelComplete();
    }

    cameraX = clamp(player.x + player.w / 2 - VIEW_W / 2, 0, Math.max(0, level.worldWidth - VIEW_W));
  }

  function updateEnemies(dt) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.x += enemy.dir * enemy.speed * dt;
      if (enemy.x < enemy.minX) { enemy.x = enemy.minX; enemy.dir = 1; }
      if (enemy.x + enemy.w > enemy.maxX) { enemy.x = enemy.maxX - enemy.w; enemy.dir = -1; }
    }
  }

  // ---------- Rendering ----------
  function drawBackground(theme) {
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    grad.addColorStop(0, theme.sky1);
    grad.addColorStop(1, theme.sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // parallax hills
    ctx.fillStyle = theme.hill;
    const parallax = cameraX * 0.3;
    for (let i = -1; i < 6; i++) {
      const bx = i * 260 - (parallax % 260);
      ctx.beginPath();
      ctx.moveTo(bx, VIEW_H - 40);
      ctx.quadraticCurveTo(bx + 100, VIEW_H - 180, bx + 220, VIEW_H - 40);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawPlatforms(theme) {
    for (const p of level.platforms) {
      const sx = p.x - cameraX;
      if (sx + p.w < 0 || sx > VIEW_W) continue;
      ctx.fillStyle = theme.platform;
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.fillStyle = theme.groundTop;
      ctx.fillRect(sx, p.y, p.w, 8);
    }
  }

  function drawCoins() {
    for (const coin of coins) {
      if (coin.collected) continue;
      const sx = coin.x - cameraX;
      if (sx < -20 || sx > VIEW_W + 20) continue;
      const bob = Math.sin(elapsed * 4 + coin.x) * 3;
      ctx.beginPath();
      ctx.fillStyle = '#ffd93d';
      ctx.arc(sx, coin.y + bob, COIN_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawEnemies() {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const sx = enemy.x - cameraX;
      if (sx + enemy.w < 0 || sx > VIEW_W) continue;
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(sx, enemy.y, enemy.w, enemy.h);
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx + 6, enemy.y + 8, 6, 6);
      ctx.fillRect(sx + enemy.w - 12, enemy.y + 8, 6, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(sx + 8, enemy.y + 10, 2, 2);
      ctx.fillRect(sx + enemy.w - 10, enemy.y + 10, 2, 2);
    }
  }

  function drawGoal() {
    const g = level.goal;
    const sx = g.x - cameraX;
    if (sx + g.w < 0 || sx > VIEW_W) return;
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(sx + g.w / 2 - 3, g.y, 6, g.h);
    const glow = 0.6 + Math.sin(elapsed * 3) * 0.4;
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.fillStyle = '#6bf7ff';
    ctx.beginPath();
    ctx.moveTo(sx + g.w / 2, g.y - 6);
    ctx.lineTo(sx + g.w / 2 + 16, g.y + 20);
    ctx.lineTo(sx + g.w / 2, g.y + 46);
    ctx.lineTo(sx + g.w / 2 - 16, g.y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawPlayer() {
    const sx = player.x - cameraX;
    const flashing = player.invuln > 0 && Math.floor(elapsed * 10) % 2 === 0;
    ctx.save();
    if (flashing) ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#3d7dff';
    ctx.fillRect(sx, player.y, player.w, player.h);
    ctx.fillStyle = '#ffe0b2';
    ctx.fillRect(sx + (player.facing > 0 ? player.w - 12 : 0), player.y + 4, 12, 12);
    ctx.fillStyle = '#000';
    const eyeX = player.facing > 0 ? sx + player.w - 6 : sx + 4;
    ctx.fillRect(eyeX, player.y + 8, 2, 2);
    ctx.restore();
  }

  function render() {
    if (!level) {
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      return;
    }
    const theme = THEMES[level.theme] || THEMES.forest;
    drawBackground(theme);
    drawPlatforms(theme);
    drawCoins();
    drawEnemies();
    drawGoal();
    drawPlayer();
  }

  // ---------- Main loop ----------
  let lastTime = performance.now();

  function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += dt;

    if (state === 'playing') {
      updateEnemies(dt);
      updatePlayer(dt);
    }

    render();

    // Read-only snapshot for the automated smoke tests (tests/smoke-test.mjs).
    window.__pixelQuestTest = {
      state, score, lives, levelIndex, playerX: player.x, playerY: player.y, onGround: player.onGround,
      enemies: level ? enemies.filter(e => e.alive).map(e => ({ x: e.x, y: e.y })) : []
    };

    requestAnimationFrame(loop);
  }

  // ---------- Init ----------
  updateHud();
  const hs = getHighscore();
  highscoreLabel.textContent = hs > 0 ? `Meilleur score : ${hs}` : '';
  showScreen('start');
  requestAnimationFrame(loop);
})();
