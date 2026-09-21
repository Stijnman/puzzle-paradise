// Sudoku Puzzle Logic
// Seeded, uniqueness-checked procedural generator.
// Math.random is supplied deterministically by the shared runtime.

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

function sudokuCandidates(values, index) {
    if (values[index]) return [];
    const row = Math.floor(index / 9);
    const col = index % 9;
    const used = new Set();

    for (let i = 0; i < 9; i++) {
        used.add(values[row * 9 + i]);
        used.add(values[i * 9 + col]);
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) used.add(values[r * 9 + c]);
    }

    return [1,2,3,4,5,6,7,8,9].filter(value => !used.has(value));
}

function countSudokuSolutions(puzzle, limit = 2) {
    const values = puzzle.flat();
    let count = 0;

    function solve() {
        if (count >= limit) return;

        let bestIndex = -1;
        let bestCandidates = null;

        for (let index = 0; index < 81; index++) {
            if (values[index]) continue;
            const candidates = sudokuCandidates(values, index);
            if (!candidates.length) return;
            if (!bestCandidates || candidates.length < bestCandidates.length) {
                bestIndex = index;
                bestCandidates = candidates;
                if (candidates.length === 1) break;
            }
        }

        if (bestIndex === -1) {
            count++;
            return;
        }

        for (const value of bestCandidates) {
            values[bestIndex] = value;
            solve();
            values[bestIndex] = 0;
            if (count >= limit) return;
        }
    }

    solve();
    return count;
}

function generateSudokuPuzzle(solution) {
    const clueTargets = { easy: 44, medium: 36, hard: 30, expert: 26 };
    const target = clueTargets[sudokuDifficulty()];
    const puzzle = solution.map(row => [...row]);
    const order = shuffled(Array.from({ length: 81 }, (_, index) => index));
    let clues = 81;

    for (const index of order) {
        if (clues <= target) break;
        const row = Math.floor(index / 9);
        const col = index % 9;
        const previous = puzzle[row][col];
        puzzle[row][col] = 0;

        if (countSudokuSolutions(puzzle, 2) === 1) {
            clues--;
        } else {
            puzzle[row][col] = previous;
        }
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
    const clues = sudokuPuzzle.flat().filter(Boolean).length;
    status.innerText = `${sudokuDifficulty()[0].toUpperCase() + sudokuDifficulty().slice(1)} · ${clues} clues · unique solution.`;
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

function sudokuCurrentValues() {
    return [...document.querySelectorAll('#sudoku-board .grid-cell')]
        .map(cell => Number(cell.innerText) || 0);
}

function checkSudokuState() {
    const values = sudokuCurrentValues();
    const status = document.getElementById('sudoku-status');

    if (hasSudokuConflict(values)) {
        status.innerText = 'There is a duplicate in a row, column, or 3×3 box.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    if (values.every(Boolean)) {
        if (sudokuIsSolved(values)) {
            status.innerText = 'Sudoku solved!';
            status.style.color = 'var(--accent-success)';
        } else {
            status.innerText = 'The grid is complete but not valid for this puzzle.';
            status.style.color = 'var(--accent-warning)';
        }
        return;
    }

    status.innerText = 'No conflicts detected.';
    status.style.color = '';
}

function sudokuIsSolved(values = sudokuCurrentValues()) {
    return values.length === 81 && values.every((value, index) =>
        value === sudokuSolution[Math.floor(index / 9)][index % 9]
    );
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

function sudokuHint() {
    const values = sudokuCurrentValues();
    if (hasSudokuConflict(values)) {
        return 'Resolve the highlighted duplicate before looking for the next deduction.';
    }

    for (let index = 0; index < 81; index++) {
        if (values[index]) continue;
        const candidates = sudokuCandidates(values, index);
        if (candidates.length === 1) {
            const row = Math.floor(index / 9);
            const col = index % 9;
            return {
                message: `Row ${row + 1}, column ${col + 1} has only one candidate: ${candidates[0]}.`,
                selector: `#sudoku-board .grid-cell[data-row="${row}"][data-col="${col}"]`
            };
        }
    }

    const units = [];
    for (let row = 0; row < 9; row++) {
        units.push({
            label: `row ${row + 1}`,
            indices: Array.from({ length: 9 }, (_, col) => row * 9 + col)
        });
    }
    for (let col = 0; col < 9; col++) {
        units.push({
            label: `column ${col + 1}`,
            indices: Array.from({ length: 9 }, (_, row) => row * 9 + col)
        });
    }
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            units.push({
                label: `box ${br * 3 + bc + 1}`,
                indices: Array.from({ length: 9 }, (_, offset) =>
                    (br * 3 + Math.floor(offset / 3)) * 9 + bc * 3 + offset % 3
                )
            });
        }
    }

    for (const unit of units) {
        for (let digit = 1; digit <= 9; digit++) {
            if (unit.indices.some(index => values[index] === digit)) continue;
            const positions = unit.indices.filter(index =>
                !values[index] && sudokuCandidates(values, index).includes(digit)
            );
            if (positions.length === 1) {
                const index = positions[0];
                const row = Math.floor(index / 9);
                const col = index % 9;
                return {
                    message: `Only row ${row + 1}, column ${col + 1} can contain ${digit} in ${unit.label}.`,
                    selector: `#sudoku-board .grid-cell[data-row="${row}"][data-col="${col}"]`
                };
            }
        }
    }

    const index = values.findIndex(value => !value);
    if (index >= 0) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        return {
            message: `Focus on row ${row + 1}, column ${col + 1}; compare its row, column, and box candidates.`,
            selector: `#sudoku-board .grid-cell[data-row="${row}"][data-col="${col}"]`
        };
    }

    return 'The grid is complete.';
}

function serializeSudoku() {
    return {
        version: 1,
        values: sudokuCurrentValues()
    };
}

function restoreSudoku(snapshot) {
    if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.values) || snapshot.values.length !== 81) {
        return false;
    }

    const cells = [...document.querySelectorAll('#sudoku-board .grid-cell')];
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const fixed = sudokuPuzzle[row][col];
        if (fixed) {
            cell.innerText = fixed;
            return;
        }
        const value = Number(snapshot.values[index]) || 0;
        cell.innerText = value >= 1 && value <= 9 ? String(value) : '';
    });
    selectedSudokuCell = null;
    checkSudokuState();
    return true;
}

window.PPEngine?.register('sudoku', {
    version: 1,
    serialize: serializeSudoku,
    restore: restoreSudoku,
    validate: () => !hasSudokuConflict(sudokuCurrentValues()),
    isSolved: () => sudokuIsSolved(),
    getHint: sudokuHint,
    countSolutions: countSudokuSolutions
});
