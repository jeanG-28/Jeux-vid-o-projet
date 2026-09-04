// Automated smoke test for Pixel Quest.
// Serves the game over a local static server, drives it in headless Chromium via
// Playwright, and checks the core gameplay loop: menu, pause, movement, coin
// collection, jumping across pits, and finishing the first level.
//
// Run with: npm test  (requires `npx playwright install --with-deps chromium` once)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4173;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURIComponent(req.url.split('?')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(ROOT, reqPath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  const consoleErrors = [];

  try {
    const page = await browser.newPage({ viewport: { width: 850, height: 500 } });
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`console: ${msg.text()}`);
    });

    await page.goto(`http://localhost:${PORT}/index.html`);

    // 1. Start screen is shown.
    await page.waitForSelector('#screen-start:not(.hidden)');
    console.log('[ok] Start screen visible');

    // 2. Starting the game hides the menu and resets the HUD.
    await page.click('#btn-start');
    await page.waitForFunction(() => document.getElementById('screen-start').classList.contains('hidden'));
    assert((await page.textContent('#hud-score')) === 'Score: 0', 'HUD score should start at 0');
    console.log('[ok] Game starts, HUD initialized');

    // 3. Pause / resume.
    await page.keyboard.press('KeyP');
    await page.waitForSelector('#screen-pause:not(.hidden)');
    await page.keyboard.press('KeyP');
    await page.waitForFunction(() => document.getElementById('screen-pause').classList.contains('hidden'));
    console.log('[ok] Pause / resume works');

    // 4. Play level 1 with a simple physics-aware bot: hold right, and jump
    // whenever about to walk off a ground platform (i.e. approaching a pit).
    await page.keyboard.down('ArrowRight');
    const deadline = Date.now() + 40000;
    let reachedLevelComplete = false;
    let sawCoinPickup = false;

    while (Date.now() < deadline) {
      const snapshot = await page.evaluate(() => window.__pixelQuestTest);
      if (!snapshot) { await page.waitForTimeout(30); continue; }
      if (snapshot.score > 0) sawCoinPickup = true;
      if (snapshot.state === 'levelcomplete') { reachedLevelComplete = true; break; }
      if (snapshot.state === 'gameover') break;

      const platforms = await page.evaluate((li) => LEVELS[li].platforms, snapshot.levelIndex);
      const lookaheadX = snapshot.playerX + 30 + 55; // player width + lookahead margin
      const hasGroundAhead = platforms.some((p) => p.y === 400 && lookaheadX >= p.x && lookaheadX <= p.x + p.w);
      const enemyAhead = snapshot.enemies.some((e) => e.x > snapshot.playerX - 10 && e.x - snapshot.playerX < 90 && Math.abs(e.y - snapshot.playerY) < 60);
      if (snapshot.onGround && (!hasGroundAhead || enemyAhead)) {
        await page.keyboard.press('Space');
      }
      await page.waitForTimeout(25);
    }
    await page.keyboard.up('ArrowRight');

    assert(sawCoinPickup, 'player should have collected at least one coin (score > 0)');
    assert(reachedLevelComplete, 'player should reach the level-complete screen within the time budget');
    console.log('[ok] Player crosses pits, defeats enemies, and completes level 1');

    // 5. The level-complete overlay must actually be shown on screen (not just
    // reflected in internal state), and its button must move the player on.
    await page.waitForSelector('#screen-level-complete:not(.hidden)', { timeout: 3000 });
    await page.click('#btn-next-level');
    await page.waitForFunction(() => document.getElementById('screen-level-complete').classList.contains('hidden'));
    await page.waitForFunction(() => window.__pixelQuestTest && window.__pixelQuestTest.levelIndex === 1);
    console.log('[ok] Level-complete screen is shown and "Niveau suivant" advances to level 2');

    assert(consoleErrors.length === 0, `no console/page errors, got: ${JSON.stringify(consoleErrors)}`);
    console.log('[ok] No console or page errors');

    console.log('\nAll smoke tests passed.');
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
