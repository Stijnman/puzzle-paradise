// Singles Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let numbers = [];

function initSingles() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    numbers = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Singles: each row and column must contain numbers 1-6
    // Some cells are pre-filled as clues

    // Initialize with Latin square
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            numbers[r * BOARD_SIZE + c] = (r + c) % BOARD_SIZE + 1;
        }
    }

    // Remove some for clues (keep 12)
    const clueCount = 12;
    let removed = 0;
    while (removed < clueCount) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        if (numbers[idx] !== 0) {
            numbers[idx] = 0;
            removed++;
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `singles-${r}-${c}`;

            if (numbers[idx]) {
                cell.innerText = numbers[idx];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.dataset.clue = 'true';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Enter number 1-6
                if (cell.classList.contains('fixed')) return;
                let current = parseInt(cell.innerText) || 0;
                current = current % BOARD_SIZE + 1;
                cell.innerText = current;
                numbers[idx] = current;
                checkSinglesWin();
            };

            board.appendChild(cell);
        }
    }

    checkSinglesWin();
}

function checkSinglesWin() {
    const status = document.getElementById('arrow-status');
    // Check all rows and columns have 1-6
    let valid = true;

    // Check rows
    for (let r = 0; r < BOARD_SIZE && valid; r++) {
        const rowNums = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (numbers[idx]) rowNums.push(numbers[idx]);
        }
        const sorted = [...rowNums].sort((a, b) => a - b);
        for (let i = 0; i < BOARD_SIZE; i++) {
            if (sorted[i] !== i + 1) valid = false;
        }
    }

    // Check columns
    for (let c = 0; c < BOARD_SIZE && valid; c++) {
        const colNums = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            const idx = r * BOARD_SIZE + c;
            if (numbers[idx]) colNums.push(numbers[idx]);
        }
        const sorted = [...colNums].sort((a, b) => a - b);
        for (let i = 0; i < BOARD_SIZE; i++) {
            if (sorted[i] !== i + 1) valid = false;
        }
    }

    if (valid) {
        status.innerText = 'Valid Latin square! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
