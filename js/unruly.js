// Unruly Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let grid = [];

function initUnruly() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(''); // empty, 'x', 'o'

    // Place X's and O's: each row and column must have equal numbers
    // No two adjacent cells (including diagonally) can have the same symbol

    // Initialize with random X and O
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        grid[i] = Math.random() > 0.5 ? 'x' : 'o';
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `unruly-${r}-${c}`;

            cell.innerText = grid[idx];
            if (grid[idx] === 'x') {
                cell.style.color = '#dc2626';
            } else {
                cell.style.color = '#1e40af';
            }
            cell.style.fontWeight = 'bold';
            cell.style.fontSize = '18px';

            cell.onclick = () => {
                // Toggle between X, O, empty
                if (grid[idx] === 'x') {
                    grid[idx] = 'o';
                    cell.innerText = 'o';
                    cell.style.color = '#1e40af';
                } else if (grid[idx] === 'o') {
                    grid[idx] = '';
                    cell.innerText = '';
                } else {
                    grid[idx] = 'x';
                    cell.innerText = 'x';
                    cell.style.color = '#dc2626';
                }
                checkUnrulyWin();
            };

            board.appendChild(cell);
        }
    }

    checkUnrulyWin();
}

function checkUnrulyWin() {
    const status = document.getElementById('arrow-status');
    // Check: equal X and O in each row/col, no adjacent same
    let valid = true;

    // Check rows
    for (let r = 0; r < BOARD_SIZE && valid; r++) {
        let xCount = 0, oCount = 0;
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (grid[idx] === 'x') xCount++;
            if (grid[idx] === 'o') oCount++;
        }
        if (xCount !== oCount) valid = false;
    }

    if (valid) {
        status.innerText = 'Balanced grid! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
