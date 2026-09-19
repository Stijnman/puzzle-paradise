// Arrow Escape Puzzle Logic
// Guaranteed-solvable seeded generator. Math.random is supplied by the shared runtime.

const DIRS = { '⬆️': [-1, 0], '⬇️': [1, 0], '⬅️': [0, -1], '➡️': [0, 1] };
const DIR_ENTRIES = Object.entries(DIRS);
let arrowSize = 6;
let arrowGrid = [];

function arrowDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function arrowBoardSize() {
    return ({ easy: 5, medium: 6, hard: 7, expert: 8 })[arrowDifficulty()];
}

function rayClearInGrid(grid, row, col, symbol) {
    const [dr, dc] = DIRS[symbol];
    let r = row + dr;
    let c = col + dc;

    while (r >= 0 && r < arrowSize && c >= 0 && c < arrowSize) {
        if (grid[r][c] != null) return false;
        r += dr;
        c += dc;
    }
    return true;
}

function buildSolvableArrowGrid() {
    const grid = Array.from({ length: arrowSize }, () => Array(arrowSize).fill(null));
    const open = Array.from({ length: arrowSize * arrowSize }, (_, index) => index);

    // Build from empty to full. Each inserted arrow has a clear route through
    // cells that are still empty. Reversing insertion order is therefore a solution.
    while (open.length) {
        const candidates = [];

        for (const index of open) {
            const row = Math.floor(index / arrowSize);
            const col = index % arrowSize;
            for (const [symbol] of DIR_ENTRIES) {
                if (rayClearInGrid(grid, row, col, symbol)) {
                    candidates.push({ index, row, col, symbol });
                }
            }
        }

        if (!candidates.length) {
            // Defensive fallback: an edge cell always has an outward direction.
            const index = open[0];
            const row = Math.floor(index / arrowSize);
            const col = index % arrowSize;
            const symbol = row === 0 ? '⬆️' : row === arrowSize - 1 ? '⬇️' : col === 0 ? '⬅️' : '➡️';
            grid[row][col] = symbol;
            open.splice(open.indexOf(index), 1);
            continue;
        }

        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        grid[pick.row][pick.col] = pick.symbol;
        open.splice(open.indexOf(pick.index), 1);
    }

    return grid;
}

function initArrowGame() {
    const board = document.getElementById('arrow-board');
    const status = document.getElementById('arrow-status');

    arrowSize = arrowBoardSize();
    board.style.gridTemplateColumns = `repeat(${arrowSize}, 1fr)`;
    board.innerHTML = '';
    arrowGrid = buildSolvableArrowGrid();

    status.innerText = `${arrowDifficulty()[0].toUpperCase() + arrowDifficulty().slice(1)} · clear all ${arrowSize * arrowSize} arrows.`;
    status.style.color = '';

    for (let r = 0; r < arrowSize; r++) {
        for (let c = 0; c < arrowSize; c++) {
            const type = arrowGrid[r][c];
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `arrow-${r}-${c}`;
            cell.innerText = type;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-label', `Arrow row ${r + 1}, column ${c + 1}, ${type}`);
            cell.onclick = () => tryClearArrow(r, c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    tryClearArrow(r, c);
                }
            };
            board.appendChild(cell);
        }
    }
}

function tryClearArrow(r, c) {
    const dir = arrowGrid[r][c];
    if (!dir) return;

    if (!rayClearInGrid(arrowGrid, r, c, dir)) {
        const status = document.getElementById('arrow-status');
        status.innerText = 'That arrow is blocked. Choose one with a clear path to the edge.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    arrowGrid[r][c] = null;
    const cell = document.getElementById(`arrow-${r}-${c}`);
    cell.classList.add('empty');
    cell.innerText = '';
    cell.removeAttribute('tabindex');
    checkArrowWin();
}

function checkArrowWin() {
    const remaining = arrowGrid.flat().filter(Boolean).length;
    const status = document.getElementById('arrow-status');

    if (remaining === 0) {
        status.innerText = 'Cleared! Puzzle solved.';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = `${remaining} arrow${remaining === 1 ? '' : 's'} remaining.`;
        status.style.color = '';
    }
}
