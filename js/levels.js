// Level data for Pixel Quest.
// Coordinates are in world pixels. The camera scrolls horizontally to follow the player.
// Ground/platform rectangles are solid (player collides with all four sides).
// Gaps in the ground are pits: falling below FALL_Y costs a life and respawns the player.

const LEVELS = [
  {
    name: 'Niveau 1 — La Forêt',
    theme: 'forest',
    worldWidth: 2500,
    playerStart: { x: 40, y: 300 },
    platforms: [
      { x: 0, y: 400, w: 560, h: 50 },
      { x: 700, y: 400, w: 520, h: 50 },
      { x: 900, y: 300, w: 110, h: 20 },
      { x: 1360, y: 400, w: 480, h: 50 },
      { x: 1560, y: 300, w: 110, h: 20 },
      { x: 1980, y: 400, w: 520, h: 50 }
    ],
    coins: [
      { x: 300, y: 360 }, { x: 340, y: 360 }, { x: 380, y: 360 },
      { x: 940, y: 260 }, { x: 980, y: 260 },
      { x: 1450, y: 360 }, { x: 1600, y: 260 }, { x: 1640, y: 260 },
      { x: 2100, y: 360 }, { x: 2150, y: 360 }, { x: 2200, y: 360 }
    ],
    enemies: [
      { x: 780, y: 368, minX: 720, maxX: 1180, speed: 60 },
      { x: 1450, y: 368, minX: 1380, maxX: 1800, speed: 70 },
      { x: 2100, y: 368, minX: 2000, maxX: 2450, speed: 65 }
    ],
    goal: { x: 2420, y: 300, w: 40, h: 100 }
  },
  {
    name: 'Niveau 2 — Les Cavernes',
    theme: 'cave',
    worldWidth: 3000,
    playerStart: { x: 40, y: 300 },
    platforms: [
      { x: 0, y: 400, w: 420, h: 50 },
      { x: 560, y: 400, w: 260, h: 50 },
      { x: 960, y: 330, w: 140, h: 20 },
      { x: 1200, y: 400, w: 220, h: 50 },
      { x: 1520, y: 320, w: 140, h: 20 },
      { x: 1760, y: 400, w: 260, h: 50 },
      { x: 2140, y: 340, w: 120, h: 20 },
      { x: 2380, y: 400, w: 620, h: 50 }
    ],
    coins: [
      { x: 200, y: 360 }, { x: 240, y: 360 },
      { x: 620, y: 360 }, { x: 660, y: 360 }, { x: 700, y: 360 },
      { x: 1000, y: 290 }, { x: 1040, y: 290 },
      { x: 1260, y: 360 }, { x: 1300, y: 360 },
      { x: 1560, y: 280 }, { x: 1600, y: 280 },
      { x: 1820, y: 360 }, { x: 1860, y: 360 }, { x: 1900, y: 360 },
      { x: 2170, y: 300 },
      { x: 2450, y: 360 }, { x: 2500, y: 360 }, { x: 2550, y: 360 }, { x: 2600, y: 360 }
    ],
    enemies: [
      { x: 620, y: 368, minX: 570, maxX: 800, speed: 75 },
      { x: 1260, y: 368, minX: 1210, maxX: 1400, speed: 80 },
      { x: 1820, y: 368, minX: 1770, maxX: 2000, speed: 85 },
      { x: 2450, y: 368, minX: 2390, maxX: 2620, speed: 80 },
      { x: 2700, y: 368, minX: 2620, maxX: 2960, speed: 90 }
    ],
    goal: { x: 2920, y: 300, w: 40, h: 100 }
  },
  {
    name: 'Niveau 3 — La Tour du Cristal',
    theme: 'tower',
    worldWidth: 3400,
    playerStart: { x: 40, y: 300 },
    platforms: [
      { x: 0, y: 400, w: 360, h: 50 },
      { x: 500, y: 400, w: 180, h: 50 },
      { x: 820, y: 330, w: 120, h: 20 },
      { x: 1040, y: 400, w: 180, h: 50 },
      { x: 1320, y: 330, w: 120, h: 20 },
      { x: 1540, y: 260, w: 120, h: 20 },
      { x: 1760, y: 400, w: 200, h: 50 },
      { x: 2060, y: 340, w: 120, h: 20 },
      { x: 2280, y: 260, w: 120, h: 20 },
      { x: 2500, y: 400, w: 220, h: 50 },
      { x: 2820, y: 340, w: 120, h: 20 },
      { x: 3040, y: 400, w: 360, h: 50 }
    ],
    coins: [
      { x: 150, y: 360 }, { x: 190, y: 360 },
      { x: 560, y: 360 }, { x: 600, y: 360 },
      { x: 860, y: 290 }, { x: 890, y: 290 },
      { x: 1090, y: 360 }, { x: 1130, y: 360 },
      { x: 1360, y: 290 },
      { x: 1580, y: 220 }, { x: 1610, y: 220 },
      { x: 1820, y: 360 }, { x: 1860, y: 360 }, { x: 1900, y: 360 },
      { x: 2100, y: 300 },
      { x: 2320, y: 220 }, { x: 2350, y: 220 },
      { x: 2560, y: 360 }, { x: 2600, y: 360 }, { x: 2640, y: 360 },
      { x: 2860, y: 300 },
      { x: 3120, y: 360 }, { x: 3160, y: 360 }, { x: 3200, y: 360 }, { x: 3240, y: 360 }
    ],
    enemies: [
      { x: 560, y: 368, minX: 510, maxX: 660, speed: 80 },
      { x: 1090, y: 368, minX: 1050, maxX: 1200, speed: 85 },
      { x: 1820, y: 368, minX: 1770, maxX: 1940, speed: 90 },
      { x: 2560, y: 368, minX: 2510, maxX: 2700, speed: 95 },
      { x: 2900, y: 368, minX: 2830, maxX: 2930, speed: 100 },
      { x: 3120, y: 368, minX: 3050, maxX: 3380, speed: 100 },
      { x: 3220, y: 368, minX: 3050, maxX: 3380, speed: -100 }
    ],
    goal: { x: 3360, y: 300, w: 40, h: 100 }
  }
];

const FALL_Y = 520; // falling below this y-coordinate costs a life
