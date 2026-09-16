// Hitori Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 5;
let grid = [];

function initHitori() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = [];

    // Initialize with random numbers 1-5
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        grid[i] = Math.floor(Math.random() * 5) + 1;
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `hitori-${r}-${c}`;

            cell.innerText = grid[idx];
            cell.style.color = 'var(--primary)';
            cell.style.fontWeight = 'bold';
            cell.dataset.value = grid[idx];

            // Mark: click to shade cell (remove)
            cell.onclick = () => {
                // Toggle: shaded (black) or keep
                if (cell.classList.contains('shaded')) {
                    cell.classList.remove('shaded');
                    cell.style.background = 'white';
                    cell.style.color = 'var(--primary)';
                } else {
                    cell.classList.add('shaded');
                    cell.style.background = '#0f172a';
                    cell.style.color = 'white';
                }
                checkHitoriWin();
            };

            board.appendChild(cell);
        }
    }

    checkHitoriWin();
}

function checkHitoriWin() {
    const status = document.getElementById('arrow-status');
    // Win condition: no two identical numbers visible (unshaded),
    // and all unshaded cells are connected
    let shadedCount = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (document.querySelector(`#hitori-${r}-${c}`).classList.contains('shaded')) {
                shadedCount++;
            }
        }
    }
    if (shadedCount > 0) {
        status.innerText = 'Shading cells...';
        status.style.color = 'var(--accent-warning)';
    }
}
