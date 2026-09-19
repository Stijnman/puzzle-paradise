// Pearl / Masyu-style Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const PEARL_SIZE = 5;
const PEARL_BLACK = new Set([
    0 * PEARL_SIZE + 0,
    0 * PEARL_SIZE + 4,
    4 * PEARL_SIZE + 4,
    4 * PEARL_SIZE + 0
]);
const PEARL_WHITE = new Set([
    0 * PEARL_SIZE + 1,
    1 * PEARL_SIZE + 4,
    4 * PEARL_SIZE + 3,
    3 * PEARL_SIZE + 0
]);
const PEARL_PIECES = [
    '',
    '─',
    '│',
    '└',
    '┌',
    '┐',
    '┘'
];
let pearlState = [];

function initPearl() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${PEARL_SIZE}, 1fr)`;
    board.innerHTML = '';
    pearlState = new Array(PEARL_SIZE * PEARL_SIZE).fill(0);

    for (let r = 0; r < PEARL_SIZE; r++) {
        for (let c = 0; c < PEARL_SIZE; c++) {
            const idx = r * PEARL_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = `pearl-${r}-${c}`;
            cell.style.position = 'relative';
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.onclick = () => cyclePearlPiece(idx, r, c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    cyclePearlPiece(idx, r, c);
                }
            };

            if (PEARL_BLACK.has(idx) || PEARL_WHITE.has(idx)) {
                const pearl = document.createElement('span');
                pearl.innerText = PEARL_BLACK.has(idx) ? '●' : '○';
                pearl.style.position = 'absolute';
                pearl.style.left = '3px';
                pearl.style.top = '1px';
                pearl.style.fontSize = '10px';
                pearl.style.color = PEARL_BLACK.has(idx) ? '#111827' : '#f8fafc';
                pearl.setAttribute('aria-hidden', 'true');
                cell.appendChild(pearl);
            }

            const piece = document.createElement('span');
            piece.id = `pearl-piece-${r}-${c}`;
            piece.style.fontSize = '23px';
            cell.appendChild(piece);
            board.appendChild(cell);
        }
    }

    const status = document.getElementById('arrow-status');
    status.innerText = 'Cycle each square through loop pieces. Build one closed loop satisfying every black and white pearl.';
    status.style.color = '';
}

function pearlDirections(piece) {
    return ({
        1: ['W', 'E'],
        2: ['N', 'S'],
        3: ['N', 'E'],
        4: ['E', 'S'],
        5: ['S', 'W'],
        6: ['W', 'N']
    })[piece] || [];
}

function pearlDelta(direction) {
    return ({
        N: [-1, 0],
        E: [0, 1],
        S: [1, 0],
        W: [0, -1]
    })[direction];
}

function pearlOpposite(direction) {
    return ({ N: 'S', E: 'W', S: 'N', W: 'E' })[direction];
}

function pearlIsCorner(piece) {
    return piece >= 3;
}

function pearlIsStraight(piece) {
    return piece === 1 || piece === 2;
}

function cyclePearlPiece(index, row, col) {
    pearlState[index] = (pearlState[index] + 1) % PEARL_PIECES.length;
    renderPearlCell(index, row, col);
    checkPearlWin();
}

function renderPearlCell(index, row, col) {
    const piece = document.getElementById(`pearl-piece-${row}-${col}`);
    const cell = document.getElementById(`pearl-${row}-${col}`);
    piece.innerText = PEARL_PIECES[pearlState[index]];
    cell.classList.toggle('empty', pearlState[index] === 0);
    cell.setAttribute(
        'aria-label',
        `${PEARL_BLACK.has(index) ? 'Black pearl, ' : PEARL_WHITE.has(index) ? 'White pearl, ' : ''}${PEARL_PIECES[pearlState[index]] || 'empty'} row ${row + 1}, column ${col + 1}`
    );
}

function pearlNeighbour(index, direction) {
    const row = Math.floor(index / PEARL_SIZE);
    const col = index % PEARL_SIZE;
    const [dr, dc] = pearlDelta(direction);
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= PEARL_SIZE || nc < 0 || nc >= PEARL_SIZE) return null;
    return nr * PEARL_SIZE + nc;
}

function pearlConnectionsValid() {
    for (let index = 0; index < pearlState.length; index++) {
        const directions = pearlDirections(pearlState[index]);
        for (const direction of directions) {
            const next = pearlNeighbour(index, direction);
            if (next === null) return false;
            if (!pearlDirections(pearlState[next]).includes(pearlOpposite(direction))) {
                return false;
            }
        }

        if (pearlState[index] !== 0) {
            const reciprocalCount = directions.filter(direction => {
                const next = pearlNeighbour(index, direction);
                return next !== null &&
                    pearlDirections(pearlState[next]).includes(pearlOpposite(direction));
            }).length;
            if (reciprocalCount !== 2) return false;
        }
    }
    return true;
}

function pearlSingleLoop() {
    const used = pearlState
        .map((piece, index) => piece ? index : -1)
        .filter(index => index >= 0);
    if (!used.length || !pearlConnectionsValid()) return false;

    const reached = new Set([used[0]]);
    const queue = [used[0]];

    while (queue.length) {
        const index = queue.shift();
        pearlDirections(pearlState[index]).forEach(direction => {
            const next = pearlNeighbour(index, direction);
            if (next !== null && !reached.has(next)) {
                reached.add(next);
                queue.push(next);
            }
        });
    }

    return reached.size === used.length;
}

function pearlCluesValid() {
    for (const index of PEARL_BLACK) {
        const piece = pearlState[index];
        if (!pearlIsCorner(piece)) return false;

        for (const direction of pearlDirections(piece)) {
            const next = pearlNeighbour(index, direction);
            if (next === null || !pearlIsStraight(pearlState[next])) return false;
        }
    }

    for (const index of PEARL_WHITE) {
        const piece = pearlState[index];
        if (!pearlIsStraight(piece)) return false;

        const neighbours = pearlDirections(piece)
            .map(direction => pearlNeighbour(index, direction))
            .filter(next => next !== null);

        if (!neighbours.some(next => pearlIsCorner(pearlState[next]))) return false;
    }
    return true;
}

function checkPearlWin() {
    const status = document.getElementById('arrow-status');
    const loop = pearlSingleLoop();
    const clues = pearlCluesValid();

    if (loop && clues) {
        status.innerText = 'One closed loop satisfies every pearl. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (pearlState.some(Boolean) && !pearlConnectionsValid()) {
        status.innerText = 'The drawn pieces contain a dangling or mismatched connection.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = 'Build one closed loop: black pearls are corners; white pearls are straights beside a corner.';
        status.style.color = '';
    }
}
