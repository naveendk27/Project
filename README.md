# Pipe Rescue – Playable Ad

A simple pipe-connection puzzle ad built in vanilla HTML5/CSS/JS.

## How to run
1. Open `index.html` in any browser — no server needed.
   Or: use VS Code Live Server for hot reload.

## How to play
- Tap pipe tiles to rotate them 90°.
- Connect the green START tile to the gold GOAL tile.
- You have 12 moves. Click "Check Path" to verify.

## What I built
- 4×4 grid with a hand-crafted solvable puzzle
- Tap-to-rotate tiles with visual feedback
- BFS path-finding algorithm to detect a valid connection
- Win/fail end card with "Play Now" CTA (non-functional, logs to console)
- Responsive portrait layout (360×640 target)

## AI/tools used
- Claude (claude.ai) — helped plan the BFS algorithm, grid data model,
  and debug rotation logic
- VS Code + Live Server — development environment

## Known issues
- Pipe emoji rendering varies by OS; replaced with simple characters
- Only one fixed puzzle (no random level generation)

## Cocos Creator version
N/A — built as vanilla HTML5. This approach was chosen to keep scope
small and ensure a reliably runnable browser build per the brief.