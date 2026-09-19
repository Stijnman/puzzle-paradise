// Sudoku Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

let selectedSudokuCell = null;

const samplePuzzle = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
];

function initSudoku() {
    const board = document.getElementById('sudoku-board');
    const status = document.getElementById('sudoku-status');
    board.innerHTML = '';
    selectedSudokuCell = null;
    status.innerText = 'Select an empty cell, then enter a number from 1 to 9.';
    status.style.color = '';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = samplePuzzle[r][c];
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
        status.innerText = 'Sudoku solved!';
        status.style.color = 'var(--accent-success)';
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
