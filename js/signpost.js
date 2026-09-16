// Signpost Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let path = [];

function initSignpost() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    path = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create a path from 1 to n where numbers indicate step order
    // The path must go horizontally or vertically between adjacent cells
    // Numbers 1 through n must all be used exactly once

    // Create a simple snake path
    let pos = 0;
    path[pos] = 1; // Start
    let dir = 0; // 0:right, 1:down, 2:left, 3:up
    const dr = [0, 1, 0, -1];
    const dc = [1, 0, -1, 0];

    // Fill the path
    for (let step = 2; step <= BOARD_SIZE * BOARD_SIZE; step++) {
        // Try to go in current direction
        let moved = false;
        for (let attempts = 0; attempts < 4; attempts++) {
            const nextR = Math.floor((pos + dr[dir] * BOARD_SIZE + dc[dir]) / BOARD_SIZE);
            const nextC = (pos + dr[dir] * BOARD_SIZE + dc[dir]) % BOARD_SIZE;

            if (nextR >= 0 && nextR < BOARD_SIZE && nextC >= 0 && nextC < BOARD_SIZE && path[nextR * BOARD_SIZE + nextC] === 0) {
                pos = nextR * BOARD_SIZE + nextC;
                path[pos] = step;
                moved = true;
                break;
            }
            dir = (dir + 1) % 4; // Turn right
        }
        if (!moved) break; // Stuck
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `signpost-${r}-${c}`;

            if (path[idx]) {
                cell.innerText = path[idx];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Toggle step number (only if not fixed in the puzzle)
                if (path[idx]) {
                    path[idx] = 0;
                    cell.innerText = '';
                } else {
                    // Fill in remaining numbers
                    let nextAvailable = 1;
                    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
                        if (!path[i]) {
                            path[i] = nextAvailable++;
                            cell.innerText = path[idx = i];
                            break;
                        }
                    }
                }
                checkSignpostWin();
            };

            board.appendChild(cell);
        }
    }

    checkSignpostWin();
}

function checkSignpostWin() {
    const status = document.getElementById('arrow-status');
    // Check if path goes from 1 to n with all numbers used
    let used = new Set();
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        if (path[i] > 0) used.add(path[i]);
    }
    const maxStep = Math.max(...Array.from(used));
    const allUsed = Array.from(used).every((v, i) => v === i + 1);

    if (maxStep === BOARD_SIZE * BOARD_SIZE && allUsed && used.size === BOARD_SIZE * BOARD_SIZE) {
        status.innerText = 'Path complete! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
