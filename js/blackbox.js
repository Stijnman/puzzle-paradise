// Black Box Puzzle Logic
// Beam behaviour follows the MIT-licensed rules/algorithm from
// Simon Tatham's Portable Puzzle Collection.

const BLACKBOX_SIZE = 6;
const BLACKBOX_BALLS = 4;
const BLACKBOX_DIRS = [
    [0, -1], // up
    [1, 0],  // right
    [0, 1],  // down
    [-1, 0]  // left
];

let blackBoxAtoms = new Set();
let blackBoxGuesses = new Set();
let blackBoxLabels = new Map();
let blackBoxShots = new Map();
let blackBoxNextShot = 1;
let blackBoxSolved = false;

function initBlackBox() {
    const board = document.getElementById('arrow-board');
    const status = document.getElementById('arrow-status');

    board.style.gridTemplateColumns = `repeat(${BLACKBOX_SIZE + 2}, 1fr)`;
    board.innerHTML = '';
    blackBoxAtoms = generateBlackBoxAtoms();
    blackBoxGuesses = new Set();
    blackBoxLabels = new Map();
    blackBoxShots = new Map();
    blackBoxNextShot = 1;
    blackBoxSolved = false;

    for (let y = 0; y < BLACKBOX_SIZE + 2; y++) {
        for (let x = 0; x < BLACKBOX_SIZE + 2; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `blackbox-${x}-${y}`;

            if (blackBoxIsCorner(x, y)) {
                configureBlackBoxCorner(cell, x, y);
            } else {
                const range = blackBoxGridToRange(x, y);
                if (range !== null) configureBlackBoxLaserCell(cell, range);
                else configureBlackBoxArenaCell(cell, x, y);
            }

            board.appendChild(cell);
        }
    }

    renderBlackBox();
    status.innerText =
        `Fire beams from the edge, place ${BLACKBOX_BALLS} ball guesses, then press ✓ to check.`;
    status.style.color = '';
}

function generateBlackBoxAtoms() {
    const atoms = new Set();
    while (atoms.size < BLACKBOX_BALLS) {
        const x = 1 + Math.floor(Math.random() * BLACKBOX_SIZE);
        const y = 1 + Math.floor(Math.random() * BLACKBOX_SIZE);
        atoms.add(`${x},${y}`);
    }
    return atoms;
}

function blackBoxIsCorner(x, y) {
    const max = BLACKBOX_SIZE + 1;
    return (x === 0 || x === max) && (y === 0 || y === max);
}

function configureBlackBoxCorner(cell, x, y) {
    if (x === 0 && y === 0) {
        cell.innerText = '✓';
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', 'Check ball guesses');
        cell.onclick = checkBlackBoxGuesses;
        cell.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                checkBlackBoxGuesses();
            }
        };
    } else if (x === BLACKBOX_SIZE + 1 && y === 0) {
        cell.innerText = `0/${BLACKBOX_BALLS}`;
        cell.id = 'blackbox-guess-count';
        cell.classList.add('fixed');
        cell.style.fontSize = '10px';
    } else {
        cell.classList.add('fixed');
    }
}

function configureBlackBoxLaserCell(cell, range) {
    cell.dataset.range = range;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Fire beam ${range + 1}`);
    cell.onclick = () => fireBlackBoxLaser(range);
    cell.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fireBlackBoxLaser(range);
        }
    };
}

function configureBlackBoxArenaCell(cell, x, y) {
    cell.dataset.x = x;
    cell.dataset.y = y;
    cell.classList.add('empty');
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('aria-label', `Arena cell row ${y}, column ${x}`);
    cell.onclick = () => toggleBlackBoxGuess(x, y);
    cell.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleBlackBoxGuess(x, y);
        }
    };
}

function blackBoxRangeToGrid(range) {
    if (range < BLACKBOX_SIZE) {
        return { x: range + 1, y: 0, direction: 2 };
    }

    range -= BLACKBOX_SIZE;
    if (range < BLACKBOX_SIZE) {
        return { x: BLACKBOX_SIZE + 1, y: range + 1, direction: 3 };
    }

    range -= BLACKBOX_SIZE;
    if (range < BLACKBOX_SIZE) {
        return { x: BLACKBOX_SIZE - range, y: BLACKBOX_SIZE + 1, direction: 0 };
    }

    range -= BLACKBOX_SIZE;
    return { x: 0, y: BLACKBOX_SIZE - range, direction: 1 };
}

function blackBoxGridToRange(x, y) {
    const max = BLACKBOX_SIZE + 1;
    if (x > 0 && x < max && y > 0 && y < max) return null;
    if (blackBoxIsCorner(x, y)) return null;

    if (y === 0) return x - 1;
    if (x === max) return y - 1 + BLACKBOX_SIZE;
    if (y === max) return (BLACKBOX_SIZE - x) + BLACKBOX_SIZE * 2;
    if (x === 0) return (BLACKBOX_SIZE - y) + BLACKBOX_SIZE * 3;
    return null;
}

function blackBoxOffset(x, y, direction) {
    const normalized = (direction + 4) % 4;
    return {
        x: x + BLACKBOX_DIRS[normalized][0],
        y: y + BLACKBOX_DIRS[normalized][1]
    };
}

function blackBoxHasBall(atoms, x, y, direction, look) {
    let point = blackBoxOffset(x, y, direction);

    if (look === 'left') point = blackBoxOffset(point.x, point.y, direction - 1);
    if (look === 'right') point = blackBoxOffset(point.x, point.y, direction + 1);

    if (
        point.x < 1 || point.x > BLACKBOX_SIZE ||
        point.y < 1 || point.y > BLACKBOX_SIZE
    ) {
        return false;
    }

    return atoms.has(`${point.x},${point.y}`);
}

function traceBlackBoxBeam(atoms, entryRange) {
    let { x, y, direction } = blackBoxRangeToGrid(entryRange);

    // Upstream Black Box gives an immediate hit priority over the
    // special reflection rule at the firing edge.
    if (blackBoxHasBall(atoms, x, y, direction, 'forward')) {
        return { type: 'H' };
    }

    if (
        blackBoxHasBall(atoms, x, y, direction, 'left') ||
        blackBoxHasBall(atoms, x, y, direction, 'right')
    ) {
        return { type: 'R' };
    }

    ({ x, y } = blackBoxOffset(x, y, direction));

    for (let guard = 0; guard < 256; guard++) {
        const exitRange = blackBoxGridToRange(x, y);
        if (exitRange !== null) {
            return exitRange === entryRange
                ? { type: 'R' }
                : { type: 'E', exit: exitRange };
        }

        if (blackBoxHasBall(atoms, x, y, direction, 'forward')) {
            return { type: 'H' };
        }

        if (blackBoxHasBall(atoms, x, y, direction, 'left')) {
            direction = (direction + 1) % 4;
            continue;
        }

        if (blackBoxHasBall(atoms, x, y, direction, 'right')) {
            direction = (direction + 3) % 4;
            continue;
        }

        ({ x, y } = blackBoxOffset(x, y, direction));
    }

    throw new Error('Black Box beam exceeded trace guard');
}

function fireBlackBoxLaser(range) {
    if (blackBoxSolved || blackBoxShots.has(range)) return;

    const result = traceBlackBoxBeam(blackBoxAtoms, range);
    blackBoxShots.set(range, result);

    if (result.type === 'H' || result.type === 'R') {
        blackBoxLabels.set(range, result.type);
    } else {
        const label = String(blackBoxNextShot++);
        blackBoxLabels.set(range, label);
        blackBoxLabels.set(result.exit, label);
        blackBoxShots.set(result.exit, { type: 'E', exit: range });
    }

    renderBlackBox();
    document.getElementById('arrow-status').innerText =
        `${blackBoxShots.size} edge position${blackBoxShots.size === 1 ? '' : 's'} resolved. Use the beam evidence to place ${BLACKBOX_BALLS} balls.`;
}

function toggleBlackBoxGuess(x, y) {
    if (blackBoxSolved) return;

    const key = `${x},${y}`;
    if (blackBoxGuesses.has(key)) {
        blackBoxGuesses.delete(key);
    } else if (blackBoxGuesses.size < BLACKBOX_BALLS) {
        blackBoxGuesses.add(key);
    } else {
        const status = document.getElementById('arrow-status');
        status.innerText = `Only ${BLACKBOX_BALLS} balls are hidden. Remove a guess before adding another.`;
        status.style.color = 'var(--accent-warning)';
        return;
    }

    renderBlackBox();
    const status = document.getElementById('arrow-status');
    status.innerText =
        `${blackBoxGuesses.size}/${BLACKBOX_BALLS} ball guesses placed. Fire more beams or press ✓ when ready.`;
    status.style.color = '';
}

function blackBoxBeamResultsMatch(first, second) {
    if (first.type !== second.type) return false;
    if (first.type === 'E') return first.exit === second.exit;
    return true;
}

function checkBlackBoxGuesses() {
    const status = document.getElementById('arrow-status');

    if (blackBoxGuesses.size !== BLACKBOX_BALLS) {
        status.innerText = `Place exactly ${BLACKBOX_BALLS} ball guesses before checking.`;
        status.style.color = 'var(--accent-warning)';
        return;
    }

    for (let range = 0; range < BLACKBOX_SIZE * 4; range++) {
        const actual = traceBlackBoxBeam(blackBoxAtoms, range);
        const guessed = traceBlackBoxBeam(blackBoxGuesses, range);

        if (!blackBoxBeamResultsMatch(actual, guessed)) {
            status.innerText = 'Those ball positions do not reproduce every possible beam path yet.';
            status.style.color = 'var(--accent-warning)';
            return;
        }
    }

    blackBoxSolved = true;
    status.innerText = 'Every beam path matches. Black Box solved!';
    status.style.color = 'var(--accent-success)';
    renderBlackBox();
}

function blackBoxEdgeSymbol(range) {
    if (blackBoxLabels.has(range)) return blackBoxLabels.get(range);

    const { direction } = blackBoxRangeToGrid(range);
    return ['↑', '→', '↓', '←'][direction];
}

function renderBlackBox() {
    const max = BLACKBOX_SIZE + 1;

    for (let y = 0; y <= max; y++) {
        for (let x = 0; x <= max; x++) {
            if (blackBoxIsCorner(x, y)) continue;

            const cell = document.getElementById(`blackbox-${x}-${y}`);
            const range = blackBoxGridToRange(x, y);

            if (range !== null) {
                cell.innerText = blackBoxEdgeSymbol(range);
                cell.style.background = blackBoxLabels.has(range)
                    ? 'rgba(99,102,241,.22)'
                    : 'rgba(8,10,24,.35)';
                continue;
            }

            const key = `${x},${y}`;
            const guessed = blackBoxGuesses.has(key);
            const actual = blackBoxAtoms.has(key);
            cell.innerText = guessed ? '●' : blackBoxSolved && actual ? '●' : '';
            cell.style.color = guessed ? 'var(--primary)' : 'var(--accent-success)';
            cell.style.background = 'rgba(8,10,24,.35)';
            cell.classList.toggle('empty', !guessed && !(blackBoxSolved && actual));
        }
    }

    const count = document.getElementById('blackbox-guess-count');
    if (count) count.innerText = `${blackBoxGuesses.size}/${BLACKBOX_BALLS}`;
}
