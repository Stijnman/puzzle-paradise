// Keen / KenKen-style Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const KEEN_SIZE = 4;
const KEEN_SOLUTION = [
    [1, 2, 3, 4],
    [2, 3, 4, 1],
    [3, 4, 1, 2],
    [4, 1, 2, 3]
];
const KEEN_CAGES = [
    { cells: [[0, 0], [1, 0]], target: 3, op: '+' },
    { cells: [[0, 1], [0, 2]], target: 6, op: '×' },
    { cells: [[0, 3], [1, 3]], target: 4, op: '÷' },
    { cells: [[1, 1], [1, 2]], target: 1, op: '−' },
    { cells: [[2, 0], [3, 0]], target: 1, op: '−' },
    { cells: [[2, 1], [2, 2]], target: 4, op: '×' },
    { cells: [[2, 3], [3, 3]], target: 1, op: '−' },
    { cells: [[3, 1], [3, 2]], target: 2, op: '÷' }
];

let keenValues = [];

function initKeen() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${KEEN_SIZE}, 1fr)`;
    board.innerHTML = '';
    keenValues = new Array(KEEN_SIZE * KEEN_SIZE).fill(0);

    for (let r = 0; r < KEEN_SIZE; r++) {
        for (let c = 0; c < KEEN_SIZE; c++) {
            const idx = r * KEEN_SIZE + c;
            const cageIndex = keenCageIndex(r, c);
            const cage = KEEN_CAGES[cageIndex];
            const isFirst = cage.cells[0][0] === r && cage.cells[0][1] === c;

            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = `keen-${r}-${c}`;
            cell.style.position = 'relative';
            cell.style.borderTopWidth = keenSameCage(cageIndex, r - 1, c) ? '1px' : '3px';
            cell.style.borderBottomWidth = keenSameCage(cageIndex, r + 1, c) ? '1px' : '3px';
            cell.style.borderLeftWidth = keenSameCage(cageIndex, r, c - 1) ? '1px' : '3px';
            cell.style.borderRightWidth = keenSameCage(cageIndex, r, c + 1) ? '1px' : '3px';
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');

            if (isFirst) {
                const clue = document.createElement('span');
                clue.innerText = `${cage.target}${cage.op}`;
                clue.style.position = 'absolute';
                clue.style.left = '4px';
                clue.style.top = '2px';
                clue.style.fontSize = '9px';
                clue.style.color = 'var(--muted)';
                cell.appendChild(clue);
            }

            const value = document.createElement('span');
            value.id = `keen-value-${r}-${c}`;
            value.style.fontSize = '17px';
            cell.appendChild(value);

            cell.onclick = () => cycleKeenCell(idx, r, c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    cycleKeenCell(idx, r, c);
                }
            };

            board.appendChild(cell);
        }
    }

    const status = document.getElementById('arrow-status');
    status.innerText = 'Fill 1–4 once per row and column while satisfying every arithmetic cage.';
    status.style.color = '';
}

function keenCageIndex(row, col) {
    return KEEN_CAGES.findIndex(cage =>
        cage.cells.some(([r, c]) => r === row && c === col)
    );
}

function keenSameCage(cageIndex, row, col) {
    if (row < 0 || row >= KEEN_SIZE || col < 0 || col >= KEEN_SIZE) return false;
    return keenCageIndex(row, col) === cageIndex;
}

function cycleKeenCell(index, row, col) {
    keenValues[index] = (keenValues[index] + 1) % (KEEN_SIZE + 1);
    const value = document.getElementById(`keen-value-${row}-${col}`);
    value.innerText = keenValues[index] || '';
    document.getElementById(`keen-${row}-${col}`).classList.toggle('empty', keenValues[index] === 0);
    checkKeenWin();
}

function keenCageSatisfied(cage) {
    const values = cage.cells.map(([r, c]) => keenValues[r * KEEN_SIZE + c]);
    if (values.some(value => value === 0)) return false;

    if (cage.op === '+') return values.reduce((a, b) => a + b, 0) === cage.target;
    if (cage.op === '×') return values.reduce((a, b) => a * b, 1) === cage.target;
    if (cage.op === '−') return Math.abs(values[0] - values[1]) === cage.target;
    if (cage.op === '÷') {
        const high = Math.max(values[0], values[1]);
        const low = Math.min(values[0], values[1]);
        return low !== 0 && high / low === cage.target;
    }
    return false;
}

function checkKeenWin() {
    const status = document.getElementById('arrow-status');
    if (keenValues.some(value => value === 0)) {
        status.innerText = 'Complete every cell and satisfy all cage clues.';
        status.style.color = '';
        return;
    }

    const rows = Array.from({ length: KEEN_SIZE }, (_, r) =>
        keenValues.slice(r * KEEN_SIZE, (r + 1) * KEEN_SIZE)
    );
    const columns = Array.from({ length: KEEN_SIZE }, (_, c) =>
        rows.map(row => row[c])
    );
    const latinValid = [...rows, ...columns].every(line => new Set(line).size === KEEN_SIZE);
    const cagesValid = KEEN_CAGES.every(keenCageSatisfied);

    if (latinValid && cagesValid) {
        status.innerText = 'Latin square and all arithmetic cages solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'Check repeated digits and arithmetic cage results.';
        status.style.color = 'var(--accent-warning)';
    }
}
