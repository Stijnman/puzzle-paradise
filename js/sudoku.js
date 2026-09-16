// Sudoku Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

let selectedSudokuCell = null;

// Sample puzzle - 0 represents empty cells
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
    board.innerHTML = '';
    selectedSudokuCell = null;

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = samplePuzzle[r][c];
            const cell = document.createElement('div');
            cell.className = 'grid-cell' + (val !== 0 ? ' fixed' : '');
            if (val !== 0) {
                cell.innerText = val;
                cell.classList.add('fixed');
            }
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.onclick = () => selectSudokuCell(cell);
            board.appendChild(cell);
        }
    }
}

function selectSudokuCell(cell) {
    if (cell.classList.contains('fixed')) return;
    document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('selected'));
    selectedSudokuCell = cell;
    cell.classList.add('selected');
}

function inputSudokuNumber(num) {
    if (selectedSudokuCell && !selectedSudokuCell.classList.contains('fixed')) {
        selectedSudokuCell.innerText = num;
    }
}