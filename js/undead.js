// Undead / Haunted Mirror Maze Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const UNDEAD_SIZE = 4;
const UNDEAD_MIRRORS = new Map([
    ['0,1', '/'],
    ['1,3', '\\'],
    ['2,0', '\\'],
    ['3,2', '/']
]);
const UNDEAD_TARGET = new Map([
    ['0,0','V'], ['0,2','G'], ['0,3','Z'],
    ['1,0','G'], ['1,1','Z'], ['1,2','V'],
    ['2,1','V'], ['2,2','G'], ['2,3','Z'],
    ['3,0','Z'], ['3,1','G'], ['3,3','V']
]);
const UNDEAD_TOTALS = { G: 4, V: 4, Z: 4 };
let undeadValues = new Map();
let undeadClues = [];

function initUndead() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${UNDEAD_SIZE + 2}, 1fr)`;
    board.innerHTML = '';
    undeadValues = new Map();
    undeadClues = calculateUndeadClues(UNDEAD_TARGET);

    for (let visualRow = 0; visualRow < UNDEAD_SIZE + 2; visualRow++) {
        for (let visualCol = 0; visualCol < UNDEAD_SIZE + 2; visualCol++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            const innerRow = visualRow - 1;
            const innerCol = visualCol - 1;

            if (
                (visualRow === 0 || visualRow === UNDEAD_SIZE + 1) &&
                (visualCol === 0 || visualCol === UNDEAD_SIZE + 1)
            ) {
                cell.classList.add('fixed');
                const labels = {
                    '0,0': 'G4',
                    [`0,${UNDEAD_SIZE + 1}`]: 'V4',
                    [`${UNDEAD_SIZE + 1},0`]: 'Z4'
                };
                cell.innerText = labels[`${visualRow},${visualCol}`] || '☽';
                cell.style.fontSize = '10px';
            } else if (visualRow === 0) {
                configureUndeadClue(cell, undeadClues[innerCol]);
            } else if (visualCol === UNDEAD_SIZE + 1) {
                configureUndeadClue(cell, undeadClues[UNDEAD_SIZE + innerRow]);
            } else if (visualRow === UNDEAD_SIZE + 1) {
                configureUndeadClue(cell, undeadClues[UNDEAD_SIZE * 2 + (UNDEAD_SIZE - 1 - innerCol)]);
            } else if (visualCol === 0) {
                configureUndeadClue(cell, undeadClues[UNDEAD_SIZE * 3 + (UNDEAD_SIZE - 1 - innerRow)]);
            } else {
                configureUndeadArena(cell, innerRow, innerCol);
            }

            board.appendChild(cell);
        }
    }

    renderUndead();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Place 4 ghosts, 4 vampires, and 4 zombies so every edge sight-line clue matches.';
    status.style.color = '';
}

function configureUndeadClue(cell, clue) {
    cell.classList.add('fixed');
    cell.innerText = String(clue);
    cell.style.fontSize = '12px';
    cell.setAttribute('aria-label', `Sight-line clue ${clue}`);
}

function configureUndeadArena(cell, row, col) {
    const key = `${row},${col}`;
    cell.id = `undead-${row}-${col}`;

    if (UNDEAD_MIRRORS.has(key)) {
        cell.classList.add('fixed');
        cell.innerText = UNDEAD_MIRRORS.get(key);
        cell.style.fontSize = '22px';
        cell.setAttribute('aria-label', `Mirror ${UNDEAD_MIRRORS.get(key)}`);
        return;
    }

    cell.classList.add('empty');
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.onclick = () => cycleUndead(row, col);
    cell.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            cycleUndead(row, col);
        }
    };
}

function cycleUndead(row, col) {
    const key = `${row},${col}`;
    const current = undeadValues.get(key) || '';
    const next = current === '' ? 'G' : current === 'G' ? 'V' : current === 'V' ? 'Z' : '';
    if (next) undeadValues.set(key, next);
    else undeadValues.delete(key);
    renderUndead();
    checkUndeadWin();
}

function undeadEntry(index) {
    if (index < UNDEAD_SIZE) {
        return { row: -1, col: index, direction: 2 };
    }
    index -= UNDEAD_SIZE;
    if (index < UNDEAD_SIZE) {
        return { row: index, col: UNDEAD_SIZE, direction: 3 };
    }
    index -= UNDEAD_SIZE;
    if (index < UNDEAD_SIZE) {
        return { row: UNDEAD_SIZE, col: UNDEAD_SIZE - 1 - index, direction: 0 };
    }
    index -= UNDEAD_SIZE;
    return { row: UNDEAD_SIZE - 1 - index, col: -1, direction: 1 };
}

function undeadStep(row, col, direction) {
    const delta = [[-1,0],[0,1],[1,0],[0,-1]][direction];
    return { row: row + delta[0], col: col + delta[1] };
}

function reflectUndead(direction, mirror) {
    if (mirror === '/') return [1,0,3,2][direction];
    return [3,2,1,0][direction];
}

function undeadVisibleCount(values, entryIndex) {
    let { row, col, direction } = undeadEntry(entryIndex);
    let reflected = false;
    let visible = 0;

    for (let guard = 0; guard < 128; guard++) {
        ({ row, col } = undeadStep(row, col, direction));
        if (row < 0 || row >= UNDEAD_SIZE || col < 0 || col >= UNDEAD_SIZE) break;

        const key = `${row},${col}`;
        const mirror = UNDEAD_MIRRORS.get(key);
        if (mirror) {
            direction = reflectUndead(direction, mirror);
            reflected = true;
            continue;
        }

        const monster = values.get(key);
        if (
            monster === 'Z' ||
            (monster === 'V' && !reflected) ||
            (monster === 'G' && reflected)
        ) {
            visible++;
        }
    }

    return visible;
}

function calculateUndeadClues(values) {
    return Array.from({ length: UNDEAD_SIZE * 4 }, (_, index) =>
        undeadVisibleCount(values, index)
    );
}

function renderUndead() {
    for (let row = 0; row < UNDEAD_SIZE; row++) {
        for (let col = 0; col < UNDEAD_SIZE; col++) {
            const key = `${row},${col}`;
            if (UNDEAD_MIRRORS.has(key)) continue;
            const cell = document.getElementById(`undead-${row}-${col}`);
            const monster = undeadValues.get(key) || '';
            cell.innerText = monster;
            cell.classList.toggle('empty', !monster);
            cell.style.color = monster === 'G' ? '#c4b5fd' : monster === 'V' ? '#fb7185' : monster === 'Z' ? '#4ade80' : '';
            cell.setAttribute(
                'aria-label',
                `${monster === 'G' ? 'Ghost' : monster === 'V' ? 'Vampire' : monster === 'Z' ? 'Zombie' : 'Empty'} row ${row + 1}, column ${col + 1}`
            );
        }
    }
}

function undeadTotalsValid() {
    return Object.entries(UNDEAD_TOTALS).every(([monster,total]) =>
        [...undeadValues.values()].filter(value => value === monster).length === total
    );
}

function checkUndeadWin() {
    const status = document.getElementById('arrow-status');
    const filled = undeadValues.size;

    if (filled < UNDEAD_TARGET.size) {
        status.innerText = `${filled}/${UNDEAD_TARGET.size} monster squares filled. Need exactly G4, V4, Z4.`;
        status.style.color = '';
        return;
    }

    const totals = undeadTotalsValid();
    const clues = calculateUndeadClues(undeadValues);
    const sightLines = clues.every((value,index) => value === undeadClues[index]);

    if (totals && sightLines) {
        status.innerText = 'Monster totals and every reflected sight line match. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = totals
            ? 'The monster totals are correct, but at least one edge sight-line clue is wrong.'
            : 'The board must contain exactly 4 ghosts, 4 vampires, and 4 zombies.';
        status.style.color = 'var(--accent-warning)';
    }
}
