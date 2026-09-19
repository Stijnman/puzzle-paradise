// Range / Kurodoko Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const RANGE_SIZE = 6;
const RANGE_TARGET_BLACK = new Set([
    0 * RANGE_SIZE + 2,
    0 * RANGE_SIZE + 5,
    2 * RANGE_SIZE + 0,
    2 * RANGE_SIZE + 3,
    4 * RANGE_SIZE + 1,
    4 * RANGE_SIZE + 4
]);
let rangeBlack = new Set();
let rangeClues = new Map();

function initRange() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${RANGE_SIZE}, 1fr)`;
    board.innerHTML = '';
    rangeBlack = new Set();
    rangeClues = buildRangeClues();

    for (let r = 0; r < RANGE_SIZE; r++) {
        for (let c = 0; c < RANGE_SIZE; c++) {
            const idx = r * RANGE_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `range-${r}-${c}`;

            if (rangeClues.has(idx)) {
                cell.classList.add('fixed');
            } else {
                cell.classList.add('empty');
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.onclick = () => toggleRangeBlack(idx);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleRangeBlack(idx);
                    }
                };
            }
            board.appendChild(cell);
        }
    }

    renderRange();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Shade cells so clues equal visible white cells in four directions; black cells cannot touch.';
    status.style.color = '';
}

function buildRangeClues() {
    const clues = new Map();
    for (let idx = 0; idx < RANGE_SIZE * RANGE_SIZE; idx++) {
        if (RANGE_TARGET_BLACK.has(idx)) continue;
        const r = Math.floor(idx / RANGE_SIZE);
        const c = idx % RANGE_SIZE;
        if ((r + c) % 2 === 0 || r === c) {
            clues.set(idx, rangeVisibility(idx, RANGE_TARGET_BLACK));
        }
    }
    return clues;
}

function rangeVisibility(index, blackSet = rangeBlack) {
    const row = Math.floor(index / RANGE_SIZE);
    const col = index % RANGE_SIZE;
    let visible = 1;

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < RANGE_SIZE && c >= 0 && c < RANGE_SIZE) {
            const next = r * RANGE_SIZE + c;
            if (blackSet.has(next)) break;
            visible++;
            r += dr;
            c += dc;
        }
    }
    return visible;
}

function toggleRangeBlack(index) {
    if (rangeClues.has(index)) return;
    if (rangeBlack.has(index)) rangeBlack.delete(index);
    else rangeBlack.add(index);
    renderRange();
    checkRangeWin();
}

function renderRange() {
    for (let r = 0; r < RANGE_SIZE; r++) {
        for (let c = 0; c < RANGE_SIZE; c++) {
            const idx = r * RANGE_SIZE + c;
            const cell = document.getElementById(`range-${r}-${c}`);

            if (rangeClues.has(idx)) {
                cell.innerText = rangeClues.get(idx);
                cell.style.background = 'rgba(99,102,241,.12)';
                cell.style.color = 'var(--primary)';
                cell.setAttribute('aria-label', `Range clue ${rangeClues.get(idx)}`);
            } else {
                const black = rangeBlack.has(idx);
                cell.innerText = '';
                cell.style.background = black ? '#0f172a' : 'rgba(8,10,24,.35)';
                cell.classList.toggle('empty', !black);
                cell.setAttribute(
                    'aria-label',
                    `${black ? 'Black' : 'White'} cell row ${r + 1}, column ${c + 1}`
                );
            }
        }
    }
}

function rangeBlackTouch() {
    for (const idx of rangeBlack) {
        const r = Math.floor(idx / RANGE_SIZE);
        const c = idx % RANGE_SIZE;
        for (const [dr, dc] of [[1, 0], [0, 1]]) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < RANGE_SIZE && nc < RANGE_SIZE && rangeBlack.has(nr * RANGE_SIZE + nc)) {
                return true;
            }
        }
    }
    return false;
}

function rangeWhiteConnected() {
    const whites = [];
    for (let i = 0; i < RANGE_SIZE * RANGE_SIZE; i++) {
        if (!rangeBlack.has(i)) whites.push(i);
    }
    if (!whites.length) return false;

    const reached = new Set([whites[0]]);
    const queue = [whites[0]];
    while (queue.length) {
        const idx = queue.shift();
        const r = Math.floor(idx / RANGE_SIZE);
        const c = idx % RANGE_SIZE;

        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= RANGE_SIZE || nc < 0 || nc >= RANGE_SIZE) continue;
            const next = nr * RANGE_SIZE + nc;
            if (rangeBlack.has(next) || reached.has(next)) continue;
            reached.add(next);
            queue.push(next);
        }
    }
    return reached.size === whites.length;
}

function checkRangeWin() {
    const cluesValid = [...rangeClues].every(([index, clue]) =>
        rangeVisibility(index) === clue
    );
    const separate = !rangeBlackTouch();
    const connected = rangeWhiteConnected();
    const status = document.getElementById('arrow-status');

    if (cluesValid && separate && connected) {
        status.innerText = 'All range clues match and the white region is connected. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (!separate) {
        status.innerText = 'Black cells may not touch along an edge.';
        status.style.color = 'var(--accent-warning)';
    } else if (!connected) {
        status.innerText = 'White cells must remain one connected region.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = 'One or more number clues do not match their visible range.';
        status.style.color = '';
    }
}
