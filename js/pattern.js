// Pattern (Nonogram) Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const BOARD_SIZE = 6;
const PATTERN_TARGET = [
    [0, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0]
];
let patternState = [];

function initPattern() {
    const board = document.getElementById('arrow-board');
    const status = document.getElementById('arrow-status');

    board.style.gridTemplateColumns = `minmax(54px,auto) repeat(${BOARD_SIZE},1fr)`;
    board.innerHTML = '';
    patternState = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    const rowClues = PATTERN_TARGET.map(line => patternClue(line));
    const colClues = Array.from({ length: BOARD_SIZE }, (_, col) =>
        patternClue(PATTERN_TARGET.map(row => row[col]))
    );

    const corner = document.createElement('div');
    corner.className = 'grid-cell fixed';
    corner.innerText = 'Clues';
    corner.style.fontSize = '10px';
    board.appendChild(corner);

    colClues.forEach(clue => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell fixed';
        cell.innerText = clue;
        cell.style.fontSize = '11px';
        cell.setAttribute('aria-label', `Column clue ${clue}`);
        board.appendChild(cell);
    });

    for (let r = 0; r < BOARD_SIZE; r++) {
        const clue = document.createElement('div');
        clue.className = 'grid-cell fixed';
        clue.innerText = rowClues[r];
        clue.style.fontSize = '11px';
        clue.setAttribute('aria-label', `Row clue ${rowClues[r]}`);
        board.appendChild(clue);

        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = `pattern-${r}-${c}`;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-label', `Empty pattern cell row ${r + 1}, column ${c + 1}`);
            cell.onclick = () => togglePatternCell(idx, r, c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    togglePatternCell(idx, r, c);
                }
            };
            board.appendChild(cell);
        }
    }

    status.innerText = 'Fill cells so every row and column matches its run-length clues.';
    status.style.color = '';
}

function patternClue(line) {
    const runs = [];
    let run = 0;

    line.forEach(value => {
        if (value) {
            run++;
        } else if (run) {
            runs.push(run);
            run = 0;
        }
    });
    if (run) runs.push(run);

    return runs.length ? runs.join(' ') : '0';
}

function togglePatternCell(index, row, col) {
    patternState[index] = patternState[index] ? 0 : 1;
    const cell = document.getElementById(`pattern-${row}-${col}`);

    cell.innerText = patternState[index] ? '■' : '';
    cell.classList.toggle('empty', !patternState[index]);
    cell.setAttribute(
        'aria-label',
        `${patternState[index] ? 'Filled' : 'Empty'} pattern cell row ${row + 1}, column ${col + 1}`
    );

    checkPatternWin();
}

function checkPatternWin() {
    const solved = patternState.every((value, index) => {
        const row = Math.floor(index / BOARD_SIZE);
        const col = index % BOARD_SIZE;
        return value === PATTERN_TARGET[row][col];
    });

    const status = document.getElementById('arrow-status');
    if (solved) {
        status.innerText = 'Pattern reconstructed. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'Match every row and column clue.';
        status.style.color = '';
    }
}
