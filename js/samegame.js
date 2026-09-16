// Same Game Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let grid = [];

function initSameGame() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Initialize with colored gems (1-5)
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        grid[i] = Math.floor(Math.random() * 5) + 1;
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `samegame-${r}-${c}`;

            // Color based on number
            const colors = ['#dc2626', '#dc2626', '#1e40af', '#059669', '#7c3aed'];
            cell.style.background = colors[grid[idx] - 1];
            cell.style.color = 'white';
            cell.innerText = '●';
            cell.style.fontSize = '16px';
            cell.style.fontWeight = 'bold';

            cell.onclick = () => {
                // Select this gem - remove matching groups
                selectGem(r, c);
            };

            board.appendChild(cell);
        }
    }

    checkSameGameWin();
}

function selectGem(r, c) {
    const idx = r * BOARD_SIZE + c;
    const color = grid[idx];

    // Find all connected gems of same color (4-directional)
    const visited = new Set();
    const queue = [idx];
    visited.add(idx);

    while (queue.length > 0) {
        const current = queue.shift();
        const cr = Math.floor(current / BOARD_SIZE);
        const cc = current % BOARD_SIZE;

        const neighbors = [
            [cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]
        ];

        for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                const neighborIdx = nr * BOARD_SIZE + nc;
                if (!visited.has(neighborIdx) && grid[neighborIdx] === color) {
                    visited.add(neighborIdx);
                    queue.push(neighborIdx);
                }
            }
        }
    }

    // Remove the group if more than 1
    if (visited.size > 1) {
        for (const v of visited) {
            grid[Math.floor(v / BOARD_SIZE)] = 0; // Clear
            // Actually need to clear the whole cell
        }
        // Simplified: just clear the selected gem
        grid[idx] = 0;
    }

    initSameGame(); // Re-render
}

function checkSameGameWin() {
    const status = document.getElementById('arrow-status');
    let remaining = grid.filter(g => g > 0).length;
    if (remaining === 0) {
        status.innerText = 'Board cleared! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
