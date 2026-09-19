// Mines / Minesweeper Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const BOARD_SIZE = 8;
const MINE_COUNT = 12;
let grid = [];
let revealedMinesCells = new Set();
let minesGameOver = false;

function initMines() {
    const board = document.getElementById('arrow-board');
    const status = document.getElementById('arrow-status');

    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    status.innerText = `Reveal all ${BOARD_SIZE * BOARD_SIZE - MINE_COUNT} safe cells.`;
    status.style.color = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    revealedMinesCells = new Set();
    minesGameOver = false;

    let placed = 0;
    while (placed < MINE_COUNT) {
        const idx = Math.floor(Math.random() * grid.length);
        if (grid[idx] !== -1) {
            grid[idx] = -1;
            placed++;
        }
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (grid[idx] === -1) continue;

            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                        nr >= 0 && nr < BOARD_SIZE &&
                        nc >= 0 && nc < BOARD_SIZE &&
                        grid[nr * BOARD_SIZE + nc] === -1
                    ) {
                        count++;
                    }
                }
            }
            grid[idx] = count;
        }
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `mines-${r}-${c}`;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-label', `Hidden cell row ${r + 1}, column ${c + 1}`);
            cell.onclick = () => revealMinesCell(r, c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    revealMinesCell(r, c);
                }
            };
            board.appendChild(cell);
        }
    }
}

function revealMinesCell(r, c) {
    if (minesGameOver) return;

    const idx = r * BOARD_SIZE + c;
    if (revealedMinesCells.has(idx)) return;

    if (grid[idx] === -1) {
        minesGameOver = true;
        revealAllMines();
        const status = document.getElementById('arrow-status');
        status.innerText = 'Mine hit. Start a new puzzle to try again.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    revealSafeArea(r, c);
    checkMinesWin();
}

function revealSafeArea(startRow, startCol) {
    const stack = [[startRow, startCol]];

    while (stack.length) {
        const [r, c] = stack.pop();
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;

        const idx = r * BOARD_SIZE + c;
        if (revealedMinesCells.has(idx) || grid[idx] === -1) continue;

        revealedMinesCells.add(idx);
        renderMinesCell(r, c);

        if (grid[idx] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr !== 0 || dc !== 0) stack.push([r + dr, c + dc]);
                }
            }
        }
    }
}

function renderMinesCell(r, c) {
    const idx = r * BOARD_SIZE + c;
    const cell = document.getElementById(`mines-${r}-${c}`);

    cell.classList.add('fixed');
    cell.removeAttribute('tabindex');

    if (grid[idx] > 0) {
        cell.innerText = grid[idx];
        cell.setAttribute('aria-label', `${grid[idx]} adjacent mines`);
    } else {
        cell.innerText = '';
        cell.classList.add('empty');
        cell.setAttribute('aria-label', 'Revealed empty cell');
    }
}

function revealAllMines() {
    grid.forEach((value, idx) => {
        if (value !== -1) return;
        const r = Math.floor(idx / BOARD_SIZE);
        const c = idx % BOARD_SIZE;
        const cell = document.getElementById(`mines-${r}-${c}`);
        cell.innerText = '💣';
        cell.style.color = '#dc2626';
        cell.setAttribute('aria-label', 'Mine');
    });
}

function checkMinesWin() {
    const safeCellCount = BOARD_SIZE * BOARD_SIZE - MINE_COUNT;
    const remaining = safeCellCount - revealedMinesCells.size;
    const status = document.getElementById('arrow-status');

    if (remaining === 0) {
        minesGameOver = true;
        status.innerText = 'All safe cells revealed. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = `${remaining} safe cell${remaining === 1 ? '' : 's'} remaining.`;
        status.style.color = '';
    }
}
