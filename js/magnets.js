// Magnets Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const MAGNET_SIZE = 4;
const MAGNET_DOMINO_COUNT = MAGNET_SIZE * MAGNET_SIZE / 2;
let magnetStates = [];

function initMagnets() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${MAGNET_SIZE + 2}, 1fr)`;
    board.innerHTML = '';
    magnetStates = new Array(MAGNET_DOMINO_COUNT).fill(0);

    addMagnetCorner(board);
    for (let c = 0; c < MAGNET_SIZE; c++) addMagnetClue(board, 2, '+', 'column');
    addMagnetCorner(board);

    for (let r = 0; r < MAGNET_SIZE; r++) {
        addMagnetClue(board, 2, '+', 'row');
        for (let c = 0; c < MAGNET_SIZE; c++) {
            const domino = r * (MAGNET_SIZE / 2) + Math.floor(c / 2);
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = `magnets-${r}-${c}`;
            cell.dataset.domino = domino;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.onclick = () => cycleMagnetDomino(domino);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    cycleMagnetDomino(domino);
                }
            };
            if (c % 2 === 0) cell.style.borderLeftWidth = '3px';
            else cell.style.borderRightWidth = '3px';
            board.appendChild(cell);
        }
        addMagnetClue(board, 2, '−', 'row');
    }

    addMagnetCorner(board);
    for (let c = 0; c < MAGNET_SIZE; c++) addMagnetClue(board, 2, '−', 'column');
    addMagnetCorner(board);

    renderMagnets();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Fill each domino with +−, −+, or neutral. Match edge counts and never let equal poles touch.';
    status.style.color = '';
}

function addMagnetCorner(board) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell fixed';
    board.appendChild(cell);
}

function addMagnetClue(board, count, pole, axis) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell fixed';
    cell.innerText = `${pole}${count}`;
    cell.style.fontSize = '11px';
    cell.setAttribute('aria-label', `${axis} clue: ${count} ${pole} poles`);
    board.appendChild(cell);
}

function magnetPoleAt(row, col) {
    const domino = row * (MAGNET_SIZE / 2) + Math.floor(col / 2);
    const state = magnetStates[domino];
    if (state === 0 || state === 3) return '';
    const firstHalf = col % 2 === 0;
    if (state === 1) return firstHalf ? '+' : '−';
    return firstHalf ? '−' : '+';
}

function cycleMagnetDomino(domino) {
    magnetStates[domino] = (magnetStates[domino] + 1) % 4;
    renderMagnets();
    checkMagnetsWin();
}

function renderMagnets() {
    for (let r = 0; r < MAGNET_SIZE; r++) {
        for (let c = 0; c < MAGNET_SIZE; c++) {
            const domino = r * (MAGNET_SIZE / 2) + Math.floor(c / 2);
            const state = magnetStates[domino];
            const pole = magnetPoleAt(r, c);
            const cell = document.getElementById(`magnets-${r}-${c}`);

            cell.innerText = state === 3 ? '·' : pole;
            cell.style.color = pole === '+' ? '#ef4444' : pole === '−' ? '#60a5fa' : '#94a3b8';
            cell.style.background = state === 3 ? 'rgba(34,197,94,.12)' : 'rgba(8,10,24,.35)';
            cell.classList.toggle('empty', state === 0);
            cell.setAttribute(
                'aria-label',
                `Domino ${domino + 1}: ${state === 0 ? 'empty' : state === 3 ? 'neutral' : pole + ' pole'}`
            );
        }
    }
}

function magnetsCount(axis, index, pole) {
    let count = 0;
    for (let i = 0; i < MAGNET_SIZE; i++) {
        const row = axis === 'row' ? index : i;
        const col = axis === 'row' ? i : index;
        if (magnetPoleAt(row, col) === pole) count++;
    }
    return count;
}

function magnetsLikePolesTouch() {
    for (let r = 0; r < MAGNET_SIZE; r++) {
        for (let c = 0; c < MAGNET_SIZE; c++) {
            const pole = magnetPoleAt(r, c);
            if (!pole) continue;
            if (c + 1 < MAGNET_SIZE && magnetPoleAt(r, c + 1) === pole) return true;
            if (r + 1 < MAGNET_SIZE && magnetPoleAt(r + 1, c) === pole) return true;
        }
    }
    return false;
}

function checkMagnetsWin() {
    const complete = magnetStates.every(state => state !== 0);
    const cluesValid = Array.from({ length: MAGNET_SIZE }, (_, i) => i).every(i =>
        magnetsCount('row', i, '+') === 2 &&
        magnetsCount('row', i, '−') === 2 &&
        magnetsCount('column', i, '+') === 2 &&
        magnetsCount('column', i, '−') === 2
    );
    const safe = !magnetsLikePolesTouch();
    const status = document.getElementById('arrow-status');

    if (complete && cluesValid && safe) {
        status.innerText = 'All pole counts match and no equal poles touch. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (!safe) {
        status.innerText = 'Equal poles may not touch horizontally or vertically.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = 'Complete every domino and match the +/− row and column counts.';
        status.style.color = '';
    }
}
