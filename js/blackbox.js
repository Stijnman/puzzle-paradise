// Black Box Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let grid = [];
let photons = [];
let revealedPhotons = 0;

function initBlackBox() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
    revealedPhotons = 0;

    // Place 2 photons in random locations
    photons = [];
    while (photons.length < 2) {
        const pos = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        const r = Math.floor(pos / BOARD_SIZE);
        const c = pos % BOARD_SIZE;
        if (!photons.some(p => p.r === r && p.c === c)) {
            photons.push({r, c});
            grid[r][c] = 1;
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `bb-${r}-${c}`;

            // Count visible photons in each direction
            let clues = [0, 0, 0, 0]; // N, S, W, E
            for (let d = 1; d < BOARD_SIZE; d++) {
                // North
                if (r - d >= 0) {
                    if (grid[r-d][c] === 1) clues[0]++; // photon found
                    else if (grid[r-d][c] === 2) break; // wall
                }
                // South
                if (r + d < BOARD_SIZE) {
                    if (grid[r+d][c] === 1) clues[1]++;
                    else if (grid[r+d][c] === 2) break;
                }
                // West
                if (c - d >= 0) {
                    if (grid[r][c-d] === 1) clues[2]++;
                    else if (grid[r][c-d] === 2) break;
                }
                // East
                if (c + d < BOARD_SIZE) {
                    if (grid[r][c+d] === 1) clues[3]++;
                    else if (grid[r][c+d] === 2) break;
                }
            }

            cell.dataset.clues = clues.join(',');

            cell.onclick = () => {
                if (grid[r][c] === 1 && cell.dataset.revealed !== 'true') {
                    cell.dataset.revealed = 'true';
                    cell.innerText = '●';
                    cell.style.color = 'var(--accent-success)';
                    revealedPhotons++;
                } else if (grid[r][c] === 0) {
                    grid[r][c] = 2; // Place wall marker
                    cell.innerText = '×';
                    cell.style.color = '#d97706';
                } else if (grid[r][c] === 2) {
                    grid[r][c] = 0;
                    cell.innerText = '';
                }
                checkBlackBoxWin();
            };

            board.appendChild(cell);
        }
    }
}

function checkBlackBoxWin() {
    const status = document.getElementById('arrow-status');
    if (revealedPhotons === photons.length) {
        status.innerText = 'Both hidden atoms found! Puzzle solved.';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = `Find the 2 hidden atoms — ${revealedPhotons} found.`;
        status.style.color = 'var(--accent-warning)';
    }
}
