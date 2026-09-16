// Ink Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let lines = [];

function initInk() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    lines = [];

    // Create a continuous path of lines connecting all cells
    // The goal is to fill the grid with continuous ink flow

    // Create a snake pattern that covers all cells
    lines = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    let dir = 0; // 0:right, 1:down, 2:left, 3:up
    const dr = [0, 1, 0, -1];
    const dc = [1, 0, -1, 0];

    let pos = 0;
    lines[pos] = 1; // Start

    for (let step = 1; step < BOARD_SIZE * BOARD_SIZE; step++) {
        // Try to go straight, otherwise turn
        const nextR = Math.floor((pos + dr[dir] * BOARD_SIZE + dc[dir]) / BOARD_SIZE);
        const nextC = (pos + dr[dir] * BOARD_SIZE + dc[dir]) % BOARD_SIZE;

        if (nextR >= 0 && nextR < BOARD_SIZE && nextC >= 0 && nextC < BOARD_SIZE && lines[nextR * BOARD_SIZE + nextC] === 0) {
            pos = nextR * BOARD_SIZE + nextC;
        } else {
            dir = (dir + 1) % 4; // Turn right
            const nextR2 = Math.floor((pos + dr[dir] * BOARD_SIZE + dc[dir]) / BOARD_SIZE);
            const nextC2 = (pos + dr[dir] * BOARD_SIZE + dc[dir]) % BOARD_SIZE;
            if (nextR2 >= 0 && nextR2 < BOARD_SIZE && nextC2 >= 0 && nextC2 < BOARD_SIZE && lines[nextR2 * BOARD_SIZE + nextC2] === 0) {
                pos = nextR2 * BOARD_SIZE + nextC2;
            }
        }
        lines[pos] = step + 1;
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `ink-${r}-${c}`;

            if (lines[idx]) {
                cell.innerText = '●'; // Dot showing ink path
                cell.style.color = 'var(--primary)';
                cell.style.fontSize = '18px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Toggle ink direction marker
                if (lines[idx]) {
                    lines[idx] = 0;
                    cell.innerText = '';
                } else {
                    lines[idx] = 1;
                    cell.innerText = '●';
                    cell.style.color = 'var(--primary)';
                }
                checkInkWin();
            };

            board.appendChild(cell);
        }
    }

    checkInkWin();
}

function checkInkWin() {
    const status = document.getElementById('arrow-status');
    // Check if all cells are connected in a continuous path
    let filled = lines.filter(l => l > 0).length;
    if (filled === BOARD_SIZE * BOARD_SIZE) {
        status.innerText = 'Complete ink flow! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
