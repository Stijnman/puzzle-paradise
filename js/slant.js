// Slant / Gokigen Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const SLANT_SIZE = 5;
let slantTarget = [];
let slantState = [];
let slantClues = [];

function initSlant() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${SLANT_SIZE * 2 + 1}, minmax(18px,1fr))`;
    board.innerHTML = '';

    slantTarget = generateSlantTarget();
    slantState = new Array(SLANT_SIZE * SLANT_SIZE).fill(0);
    slantClues = calculateSlantClues(slantTarget);

    for (let vr = 0; vr < SLANT_SIZE * 2 + 1; vr++) {
        for (let vc = 0; vc < SLANT_SIZE * 2 + 1; vc++) {
            const cell = document.createElement('div');
            cell.style.minWidth = '18px';
            cell.style.minHeight = '18px';
            cell.style.display = 'grid';
            cell.style.placeItems = 'center';

            if (vr % 2 === 0 && vc % 2 === 0) {
                const clueIndex = (vr / 2) * (SLANT_SIZE + 1) + vc / 2;
                cell.className = 'grid-cell fixed';
                cell.innerText = slantClues[clueIndex];
                cell.style.fontSize = '9px';
                cell.setAttribute('aria-label', `Vertex clue ${slantClues[clueIndex]}`);
            } else if (vr % 2 === 1 && vc % 2 === 1) {
                const row = (vr - 1) / 2;
                const col = (vc - 1) / 2;
                const idx = row * SLANT_SIZE + col;
                cell.className = 'grid-cell empty';
                cell.id = `slant-${row}-${col}`;
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.onclick = () => cycleSlant(idx, row, col);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        cycleSlant(idx, row, col);
                    }
                };
            } else {
                cell.className = 'slant-spacer';
                cell.setAttribute('aria-hidden', 'true');
            }

            board.appendChild(cell);
        }
    }

    const status = document.getElementById('arrow-status');
    status.innerText = 'Put / or \\ in every square so vertex counts match and the diagonals never form a loop.';
    status.style.color = '';
}

function generateSlantTarget() {
    let target = new Array(SLANT_SIZE * SLANT_SIZE).fill(1);

    for (let idx = 0; idx < target.length; idx++) {
        target[idx] = Math.random() < 0.5 ? -1 : 1;
        if (slantHasLoop(target, true)) target[idx] *= -1;
        if (slantHasLoop(target, true)) target[idx] = 1;
    }

    if (slantHasLoop(target, true)) {
        target.fill(1);
    }
    return target;
}

function slantEdge(index, value) {
    const row = Math.floor(index / SLANT_SIZE);
    const col = index % SLANT_SIZE;

    if (value === 1) {
        return [
            row * (SLANT_SIZE + 1) + col,
            (row + 1) * (SLANT_SIZE + 1) + col + 1
        ];
    }

    return [
        row * (SLANT_SIZE + 1) + col + 1,
        (row + 1) * (SLANT_SIZE + 1) + col
    ];
}

function slantHasLoop(state, ignoreBlanks = false) {
    const count = (SLANT_SIZE + 1) * (SLANT_SIZE + 1);
    const parent = Array.from({ length: count }, (_, index) => index);

    function find(value) {
        while (parent[value] !== value) {
            parent[value] = parent[parent[value]];
            value = parent[value];
        }
        return value;
    }

    function join(a, b) {
        a = find(a);
        b = find(b);
        if (a === b) return false;
        parent[b] = a;
        return true;
    }

    for (let i = 0; i < state.length; i++) {
        if (state[i] === 0 && ignoreBlanks) continue;
        if (state[i] === 0) continue;
        const [a, b] = slantEdge(i, state[i]);
        if (!join(a, b)) return true;
    }
    return false;
}

function calculateSlantClues(state) {
    const clues = new Array((SLANT_SIZE + 1) * (SLANT_SIZE + 1)).fill(0);
    state.forEach((value, index) => {
        const [a, b] = slantEdge(index, value);
        clues[a]++;
        clues[b]++;
    });
    return clues;
}

function cycleSlant(index, row, col) {
    slantState[index] = slantState[index] === 0 ? 1 : slantState[index] === 1 ? -1 : 0;
    const cell = document.getElementById(`slant-${row}-${col}`);
    cell.innerText = slantState[index] === 1 ? '\\' : slantState[index] === -1 ? '/' : '';
    cell.classList.toggle('empty', slantState[index] === 0);
    cell.setAttribute(
        'aria-label',
        `Slant row ${row + 1}, column ${col + 1}, ${slantState[index] === 1 ? 'backslash' : slantState[index] === -1 ? 'slash' : 'empty'}`
    );
    checkSlantWin();
}

function checkSlantWin() {
    const status = document.getElementById('arrow-status');

    if (slantState.some(value => value === 0)) {
        status.innerText = 'Fill every square with a diagonal.';
        status.style.color = '';
        return;
    }

    const countsValid = calculateSlantClues(slantState).every(
        (value, index) => value === slantClues[index]
    );
    const noLoop = !slantHasLoop(slantState);

    if (countsValid && noLoop) {
        status.innerText = 'All vertex clues match and no loop exists. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (!noLoop) {
        status.innerText = 'Those diagonals form a forbidden loop.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = 'One or more vertex clues do not match.';
        status.style.color = 'var(--accent-warning)';
    }
}
