// ─── TILE DEFINITIONS ───────────────────────────────────────────────
// Each tile has:
//   type: 'straight' | 'elbow' | 'source' | 'goal' | 'empty'
//   rotation: 0, 90, 180, 270  (degrees)
//   open sides at rotation=0, then rotate mentally

// For path-finding, each tile type has open "sides" at rotation 0:
// sides: [top, right, bottom, left]  true = open
const BASE_CONNECTIONS = {
  straight: [true,  false, true,  false],  // vertical pipe
  elbow:    [false, true,  true,  false],  // bottom-right elbow
  source:   [false, true,  false, false],  // source opens right
  goal:     [false, false, false, true ],  // goal opens left
  empty:    [false, false, false, false],
};

// Rotate an array of 4 booleans clockwise by n*90 degrees
function rotate(sides, times) {
  let s = [...sides];
  for (let i = 0; i < times; i++) {
    s = [s[3], s[0], s[1], s[2]]; // [top,right,bottom,left] shift right
  }
  return s;
}

// Get open sides for a tile considering its current rotation
function getOpenSides(tile) {
  const base = BASE_CONNECTIONS[tile.type];
  return rotate(base, tile.rotation / 90);
}

// ─── PUZZLE LAYOUT (4×4 grid, row by row) ───────────────────────────
// Each cell: [type, rotation]
// This is a hand-crafted solvable puzzle.
// Solution path: (0,0)→(0,1)→(0,2)→(1,2)→(2,2)→(2,3)→(3,3)
const INITIAL_GRID = [
  // Row 0
  ['source',   0  ], ['straight', 0  ], ['elbow',    90 ], ['empty',    0  ],
  // Row 1
  ['empty',    0  ], ['empty',    0  ], ['straight', 0  ], ['empty',    0  ],
  // Row 2
  ['empty',    0  ], ['empty',    0  ], ['elbow',    180], ['straight', 90 ],
  // Row 3
  ['empty',    0  ], ['empty',    0  ], ['empty',    0  ], ['goal',     0  ],
];

// Puzzle emoji display
const TILE_EMOJI = {
  source:   '🟢',
  goal:     '🟡',
  straight: '║',  // will be rotated visually with CSS transform
  elbow:    '╚',
  empty:    '·',
};

// ─── GAME STATE ──────────────────────────────────────────────────────
let grid = [];
let movesLeft = 12;
let gameOver = false;

// Build grid from INITIAL_GRID
function initGrid() {
  grid = INITIAL_GRID.map(([type, rotation]) => ({ type, rotation }));
  movesLeft = 12;
  gameOver = false;
}

// ─── RENDERING ───────────────────────────────────────────────────────
function getEmoji(tile) {
  const emojis = {
    source:   '▶',
    goal:     '★',
    straight: '|',
    elbow:    'L',
    empty:    '·',
  };
  return emojis[tile.type];
}

function renderGrid() {
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';

  grid.forEach((tile, idx) => {
    const div = document.createElement('div');
    div.className = 'tile';
    if (tile.type === 'source') div.classList.add('source');
    if (tile.type === 'goal')   div.classList.add('goal');

    // Visual rotation via CSS
    div.style.transform = `rotate(${tile.rotation}deg)`;
    div.textContent = getEmoji(tile);

    // Only rotatable tiles respond to taps
    if (tile.type !== 'source' && tile.type !== 'goal' && tile.type !== 'empty') {
      div.addEventListener('click', () => handleTap(idx));
    }

    gridEl.appendChild(div);
  });

  document.getElementById('moves-count').textContent = movesLeft;
}

// ─── INPUT ───────────────────────────────────────────────────────────
function handleTap(idx) {
  if (gameOver) return;
  if (movesLeft <= 0) return;

  grid[idx].rotation = (grid[idx].rotation + 90) % 360;
  movesLeft--;

  renderGrid();
  document.getElementById('status-msg').textContent = '';

  if (movesLeft <= 0 && !checkPath()) {
    showEndScreen(false);
  }
}

// ─── PATH CHECK (BFS) ────────────────────────────────────────────────
// Directions: 0=top, 1=right, 2=bottom, 3=left
const DR = [-1, 0, 1, 0];  // row delta
const DC = [0, 1, 0, -1];  // col delta
const OPPOSITE = [2, 3, 0, 1]; // opposite of each direction

function checkPath() {
  // Find source tile
  const srcIdx = grid.findIndex(t => t.type === 'source');
  if (srcIdx < 0) return false;

  const visited = new Set();
  const queue = [srcIdx];
  visited.add(srcIdx);

  while (queue.length > 0) {
    const curr = queue.shift();
    const row = Math.floor(curr / 4);
    const col = curr % 4;
    const sides = getOpenSides(grid[curr]);

    // Check all 4 directions
    for (let dir = 0; dir < 4; dir++) {
      if (!sides[dir]) continue; // this tile doesn't open in this direction

      const nr = row + DR[dir];
      const nc = col + DC[dir];
      if (nr < 0 || nr >= 4 || nc < 0 || nc >= 4) continue;

      const neighborIdx = nr * 4 + nc;
      if (visited.has(neighborIdx)) continue;

      const neighborSides = getOpenSides(grid[neighborIdx]);
      if (!neighborSides[OPPOSITE[dir]]) continue; // neighbor doesn't connect back

      if (grid[neighborIdx].type === 'goal') return true; // 🎉 connected!

      visited.add(neighborIdx);
      queue.push(neighborIdx);
    }
  }
  return false;
}

// ─── SCREENS ─────────────────────────────────────────────────────────
function showEndScreen(won) {
  gameOver = true;
  document.getElementById('game-screen').classList.add('hidden');
  const endScreen = document.getElementById('end-screen');
  endScreen.classList.remove('hidden');

  document.getElementById('end-title').textContent    = won ? '🎉 You fixed it!' : '💧 Out of moves!';
  document.getElementById('end-subtitle').textContent = won ? 'Puzzle complete'   : 'The pipes aren\'t connected yet.';
  document.getElementById('play-now-btn').style.display = won ? 'block' : 'none';
  document.getElementById('retry-btn').style.display    = 'block';
}

// Check Path button
document.getElementById('check-btn').addEventListener('click', () => {
  if (checkPath()) {
    showEndScreen(true);
  } else {
    document.getElementById('status-msg').textContent = 'Not connected yet. Keep rotating!';
  }
});

// Play Now (mock CTA)
document.getElementById('play-now-btn').addEventListener('click', () => {
  console.log('CTA clicked — Play Now!');
  alert('Thanks for playing! 🎮');
});

// Retry
document.getElementById('retry-btn').addEventListener('click', () => {
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  initGrid();
  renderGrid();
  document.getElementById('status-msg').textContent = '';
});

// ─── START ───────────────────────────────────────────────────────────
initGrid();
renderGrid();