// Black Box Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let grid = [];

function initBlackBox() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = [];

    // Place 2 photons in random locations
    const photons = [];
    while (photons.length < 2) {
        const pos = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        const r = Math.floor(pos / BOARD_SIZE);
        const c = pos % BOARD_SIZE;
        if (!photons.some(p => p.r === r && p.c === c)) {
            photons.push({r, c});
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        grid[r] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            grid[r][c] = 0; // 0=empty, 1=photon, 2=wall marker
            
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
                if (grid[r][c] === 0) {
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
    // Check if all photons are surrounded by walls
    let photonsFound = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (grid[r][c] === 1) photonsFound++;
        }
    }
    if (photonsFound === 0) {
        status.innerText = 'All photons contained! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
