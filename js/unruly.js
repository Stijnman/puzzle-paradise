// Unruly / Binary Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const UNRULY_SIZE = 6;
const UNRULY_TARGET_ROWS = [
    '001011',
    '001101',
    '110010',
    '010011',
    '101100',
    '110100'
];
let unrulyValues = [];
let unrulyFixed = new Set();

function initUnruly() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${UNRULY_SIZE},1fr)`;
    board.innerHTML = '';

    const target = UNRULY_TARGET_ROWS.join('').split('').map(value => value === '1' ? 'X' : 'O');
    if (Math.random() < .5) {
        for (let i = 0; i < target.length; i++) target[i] = target[i] === 'X' ? 'O' : 'X';
    }

    const clueCounts = { easy:20, medium:16, hard:12, expert:9 };
    const count = clueCounts[window.PP_DIFFICULTY] || 16;
    const indices = Array.from({ length: target.length }, (_, index) => index);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i],indices[j]] = [indices[j],indices[i]];
    }

    unrulyFixed = new Set(indices.slice(0,count));
    unrulyValues = target.map((value,index) => unrulyFixed.has(index) ? value : '');

    for (let r = 0; r < UNRULY_SIZE; r++) {
        for (let c = 0; c < UNRULY_SIZE; c++) {
            const idx = r * UNRULY_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell' + (unrulyFixed.has(idx) ? ' fixed' : ' empty');
            cell.id = `unruly-${r}-${c}`;

            if (!unrulyFixed.has(idx)) {
                cell.setAttribute('role','button');
                cell.setAttribute('tabindex','0');
                cell.onclick = () => cycleUnruly(idx);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        cycleUnruly(idx);
                    }
                };
            }
            board.appendChild(cell);
        }
    }

    renderUnruly();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Balance X/O in every row and column, avoid triples, and keep completed lines unique.';
    status.style.color = '';
}

function cycleUnruly(index) {
    const value = unrulyValues[index];
    unrulyValues[index] = value === '' ? 'X' : value === 'X' ? 'O' : '';
    renderUnruly();
    checkUnrulyWin();
}

function renderUnruly() {
    for (let r = 0; r < UNRULY_SIZE; r++) {
        for (let c = 0; c < UNRULY_SIZE; c++) {
            const idx = r * UNRULY_SIZE + c;
            const cell = document.getElementById(`unruly-${r}-${c}`);
            const value = unrulyValues[idx];
            cell.innerText = value;
            cell.style.color = value === 'X' ? '#ef718f' : value === 'O' ? '#65bfff' : '';
            cell.classList.toggle('empty', !value && !unrulyFixed.has(idx));
            cell.setAttribute('aria-label', `${unrulyFixed.has(idx) ? 'Fixed ' : ''}${value || 'empty'}, row ${r + 1}, column ${c + 1}`);
        }
    }
}

function unrulyLineValid(line, completeOnly = false) {
    if (!completeOnly) {
        for (let i = 0; i <= line.length - 3; i++) {
            if (line[i] && line[i] === line[i+1] && line[i] === line[i+2]) return false;
        }
        const x = line.filter(value => value === 'X').length;
        const o = line.filter(value => value === 'O').length;
        return x <= UNRULY_SIZE / 2 && o <= UNRULY_SIZE / 2;
    }
    return line.filter(value => value === 'X').length === UNRULY_SIZE/2 &&
        line.filter(value => value === 'O').length === UNRULY_SIZE/2 &&
        unrulyLineValid(line,false);
}

function checkUnrulyWin() {
    const status = document.getElementById('arrow-status');
    const rows = Array.from({ length: UNRULY_SIZE }, (_, row) =>
        unrulyValues.slice(row * UNRULY_SIZE, (row + 1) * UNRULY_SIZE)
    );
    const cols = Array.from({ length: UNRULY_SIZE }, (_, col) => rows.map(row => row[col]));

    if (![...rows,...cols].every(line => unrulyLineValid(line,false))) {
        status.innerText = 'A line has too many of one symbol or contains three identical symbols in a row.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    if (unrulyValues.some(value => !value)) {
        status.innerText = 'Continue filling the binary grid.';
        status.style.color = '';
        return;
    }

    const balanced = [...rows,...cols].every(line => unrulyLineValid(line,true));
    const unique = new Set(rows.map(line => line.join(''))).size === UNRULY_SIZE &&
        new Set(cols.map(line => line.join(''))).size === UNRULY_SIZE;

    if (balanced && unique) {
        status.innerText = 'Balanced, unique, and triple-free. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'Completed rows and columns must also be unique.';
        status.style.color = 'var(--accent-warning)';
    }
}
