// Towers / Skyscrapers Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const TOWERS_SIZE = 4;
let towersValues = [];
let towersClues = null;

function initTowers() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${TOWERS_SIZE + 2}, 1fr)`;
    board.innerHTML = '';

    const solution = generateTowersSolution();
    towersClues = {
        top: Array.from({ length: TOWERS_SIZE }, (_, c) =>
            towersVisible(solution.map(row => row[c]))
        ),
        bottom: Array.from({ length: TOWERS_SIZE }, (_, c) =>
            towersVisible(solution.map(row => row[c]).reverse())
        ),
        left: solution.map(row => towersVisible(row)),
        right: solution.map(row => towersVisible([...row].reverse()))
    };
    towersValues = new Array(TOWERS_SIZE * TOWERS_SIZE).fill(0);

    addTowerClueCell(board, '');
    towersClues.top.forEach(value => addTowerClueCell(board, value));
    addTowerClueCell(board, '');

    for (let r = 0; r < TOWERS_SIZE; r++) {
        addTowerClueCell(board, towersClues.left[r]);

        for (let c = 0; c < TOWERS_SIZE; c++) {
            const idx = r * TOWERS_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = `towers-${r}-${c}`;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.onclick = () => cycleTower(idx, r, c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    cycleTower(idx, r, c);
                }
            };
            board.appendChild(cell);
        }

        addTowerClueCell(board, towersClues.right[r]);
    }

    addTowerClueCell(board, '');
    towersClues.bottom.forEach(value => addTowerClueCell(board, value));
    addTowerClueCell(board, '');

    const status = document.getElementById('arrow-status');
    status.innerText = 'Fill 1–4 once per row and column; edge clues count visible towers.';
    status.style.color = '';
}

function generateTowersSolution() {
    const base = Array.from({ length: TOWERS_SIZE }, (_, r) =>
        Array.from({ length: TOWERS_SIZE }, (_, c) => (r + c) % TOWERS_SIZE + 1)
    );

    const rowOffset = Math.floor(Math.random() * TOWERS_SIZE);
    const colOffset = Math.floor(Math.random() * TOWERS_SIZE);

    return Array.from({ length: TOWERS_SIZE }, (_, r) =>
        Array.from({ length: TOWERS_SIZE }, (_, c) =>
            base[(r + rowOffset) % TOWERS_SIZE][(c + colOffset) % TOWERS_SIZE]
        )
    );
}

function towersVisible(line) {
    let highest = 0;
    let visible = 0;
    line.forEach(height => {
        if (height > highest) {
            highest = height;
            visible++;
        }
    });
    return visible;
}

function addTowerClueCell(board, value) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell fixed';
    cell.innerText = value === '' ? '' : String(value);
    cell.style.fontSize = '13px';
    cell.setAttribute('aria-label', value === '' ? 'Corner' : `Visibility clue ${value}`);
    board.appendChild(cell);
}

function cycleTower(index, row, col) {
    towersValues[index] = (towersValues[index] + 1) % (TOWERS_SIZE + 1);
    const cell = document.getElementById(`towers-${row}-${col}`);
    cell.innerText = towersValues[index] || '';
    cell.classList.toggle('empty', towersValues[index] === 0);
    cell.setAttribute(
        'aria-label',
        `Tower row ${row + 1}, column ${col + 1}, ${towersValues[index] || 'empty'}`
    );
    checkTowersWin();
}

function checkTowersWin() {
    const status = document.getElementById('arrow-status');
    if (towersValues.some(value => value === 0)) {
        status.innerText = 'Fill every square with a height from 1 to 4.';
        status.style.color = '';
        return;
    }

    const rows = Array.from({ length: TOWERS_SIZE }, (_, r) =>
        towersValues.slice(r * TOWERS_SIZE, (r + 1) * TOWERS_SIZE)
    );
    const columns = Array.from({ length: TOWERS_SIZE }, (_, c) =>
        rows.map(row => row[c])
    );
    const expected = new Set([1, 2, 3, 4]);
    const latinValid = [...rows, ...columns].every(line =>
        line.length === expected.size && new Set(line).size === expected.size
    );
    const cluesValid =
        rows.every((row, r) =>
            towersVisible(row) === towersClues.left[r] &&
            towersVisible([...row].reverse()) === towersClues.right[r]
        ) &&
        columns.every((column, c) =>
            towersVisible(column) === towersClues.top[c] &&
            towersVisible([...column].reverse()) === towersClues.bottom[c]
        );

    if (latinValid && cluesValid) {
        status.innerText = 'All visibility clues satisfied. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'Check row/column repeats and the visibility clues.';
        status.style.color = 'var(--accent-warning)';
    }
}
