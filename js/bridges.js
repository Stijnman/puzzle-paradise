// Bridges Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let grid = [];

function initBridges() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = [];

    // Initialize grid with numbers (clues)
    // Standard puzzle: place numbers 0-2 in cells
    const cluePositions = [
        [0, 1], [1, 0], [1, 5], [2, 3], [3, 3], [5, 1], [5, 4]
    ];

    for (let i = 0; i < cluePositions.length; i++) {
        const [r, c] = cluePositions[i];
        grid[r][c] = i + 1; // 1-7
    }
    // Fill rest with 0
    for (let r = 0; r < BOARD_SIZE; r++) {
        grid[r] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!grid[r]) grid[r] = [];
            if (grid[r][c] === undefined) grid[r][c] = 0;
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `bridges-${r}-${c}`;
            cell.dataset.value = grid[r][c] || '';

            // Draw horizontal/vertical lines based on value
            if (grid[r][c] && grid[r][c] <= 2) {
                cell.innerText = grid[r][c] === 1 ? '─' : '│';
                cell.style.color = 'var(--primary)';
            }

            cell.onclick = () => {
                // Toggle line direction
                if (!grid[r][c]) {
                    grid[r][c] = 1;
                    cell.innerText = '─';
                    cell.style.color = 'var(--primary)';
                } else if (grid[r][c] === 1) {
                    grid[r][c] = 2;
                    cell.innerText = '│';
                    cell.style.color = 'var(--primary)';
                } else {
                    grid[r][c] = 0;
                    cell.innerText = '';
                }
                checkBridgesWin();
            };

            board.appendChild(cell);
        }
    }
}

function checkBridgesWin() {
    const status = document.getElementById('arrow-status');
    // Check if all cells are connected properly
    // Simplified win condition
    let filled = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (grid[r][c] && grid[r][c] <= 2) filled++;
        }
    }
    if (filled > 0) {
        status.innerText = 'Connect all islands!';
        status.style.color = 'var(--accent-success)';
    }
}
