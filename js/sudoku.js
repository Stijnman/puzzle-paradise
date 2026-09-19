// Sudoku Puzzle Logic
// Seeded procedural generator. Math.random is supplied by the shared runtime.

let selectedSudokuCell = null;
let sudokuPuzzle = [];
let sudokuSolution = [];

function sudokuDifficulty() {
    return ['easy', 'medium', 'hard', 'expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function shuffled(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function generateSudokuSolution() {
    const base = [1,2,3,4,5,6,7,8,9];
    const bands = shuffled([0,1,2]);
    const stacks = shuffled([0,1,2]);
    const rows = bands.flatMap(band => shuffled([0,1,2]).map(offset => band * 3 + offset));
    const cols = stacks.flatMap(stack => shuffled([0,1,2]).map(offset => stack * 3 + offset));
    const digits = shuffled(base);

    const pattern = (row, col) => (row * 3 + Math.floor(row / 3) + col) % 9;
    return rows.map(row => cols.map(col => digits[pattern(row, col)]));
}

function generateSudokuPuzzle(solution) {
    const clueTargets = { easy: 46, medium: 38, hard: 32, expert: 27 };
    const target = clueTargets[sudokuDifficulty()];
    const puzzle = solution.map(row => [...row]);
    const cells = shuffled(Array.from({ length: 81 }, (_, index) => index));

    for (const index of cells.slice(0, 81 - target)) {
        puzzle[Math.floor(index / 9)][index % 9] = 0;
    }
    return puzzle;
}

function initSudoku() {
    const board = document.getElementById('sudoku-board');
    const status = document.getElementById('sudoku-status');

    sudokuSolution = generateSudokuSolution();
    sudokuPuzzle = generateSudokuPuzzle(sudokuSolution);

    board.innerHTML = '';
    selectedSudokuCell = null;
    status.innerText = `${sudokuDifficulty()[0].toUpperCase() + sudokuDifficulty().slice(1)} · select a cell and enter 1–9.`;
    status.style.color = '';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = sudokuPuzzle[r][c];
            const cell = document.createElement('div');
            cell.className = 'grid-cell' + (val !== 0 ? ' fixed' : '');
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (val !== 0) {
                cell.innerText = val;
                cell.setAttribute('aria-label', `Fixed ${val}, row ${r + 1}, column ${c + 1}`);
            } else {
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.setAttribute('aria-label', `Empty Sudoku cell, row ${r + 1}, column ${c + 1}`);
                cell.onclick = () => selectSudokuCell(cell);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectSudokuCell(cell);
                    }
                };
            }
            board.appendChild(cell);
        }
    }
}

function selectSudokuCell(cell) {
    if (cell.classList.contains('fixed')) return;
    document.querySelectorAll('#sudoku-board .grid-cell').forEach(item => item.classList.remove('selected'));
    selectedSudokuCell = cell;
    cell.classList.add('selected');
}

function inputSudokuNumber(num) {
    if (!selectedSudokuCell || selectedSudokuCell.classList.contains('fixed')) return;
    if (!Number.isInteger(num) || num < 1 || num > 9) return;

    selectedSudokuCell.innerText =
        selectedSudokuCell.innerText === String(num) ? '' : String(num);

    const row = Number(selectedSudokuCell.dataset.row);
    const col = Number(selectedSudokuCell.dataset.col);
    selectedSudokuCell.setAttribute(
        'aria-label',
        selectedSudokuCell.innerText
            ? `Sudoku cell ${selectedSudokuCell.innerText}, row ${row + 1}, column ${col + 1}`
            : `Empty Sudoku cell, row ${row + 1}, column ${col + 1}`
    );

    checkSudokuState();
}

function checkSudokuState() {
    const cells = [...document.querySelectorAll('#sudoku-board .grid-cell')];
    const values = cells.map(cell => Number(cell.innerText) || 0);
    const status = document.getElementById('sudoku-status');

    if (hasSudokuConflict(values)) {
        status.innerText = 'There is a duplicate in a row, column, or 3×3 box.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    if (values.every(Boolean)) {
        const exact = values.every((value, index) =>
            value === sudokuSolution[Math.floor(index / 9)][index % 9]
        );
        if (exact) {
            status.innerText = 'Sudoku solved!';
            status.style.color = 'var(--accent-success)';
        } else {
            status.innerText = 'The grid is complete but does not match this seeded solution.';
            status.style.color = 'var(--accent-warning)';
        }
        return;
    }

    status.innerText = 'No conflicts detected.';
    status.style.color = '';
}

function hasSudokuConflict(values) {
    const groups = [];
    for (let i = 0; i < 9; i++) {
        groups.push(values.slice(i * 9, i * 9 + 9));
        groups.push(Array.from({ length: 9 }, (_, r) => values[r * 9 + i]));
    }

    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const box = [];
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    box.push(values[(boxRow * 3 + r) * 9 + boxCol * 3 + c]);
                }
            }
            groups.push(box);
        }
    }

    return groups.some(group => {
        const filled = group.filter(Boolean);
        return new Set(filled).size !== filled.length;
    });
}
