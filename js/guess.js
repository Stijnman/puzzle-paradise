// Guess Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 5;
let numbers = [];

function initGuess() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    numbers = [];

    // Place numbers 1-5 in each row and column (Latin square)
    // Some cells are given as clues
    numbers = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    
    // Create a Latin square
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            numbers[r * BOARD_SIZE + c] = (r + c) % BOARD_SIZE + 1;
        }
    }
    
    // Remove some numbers for clues
    const clueCount = 10;
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
            cell.id = `guess-${r}-${c}`;
            
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
                // Toggle number (enter a guess)
                if (cell.classList.contains('fixed')) return; // Can't change clues
                
                // Cycle through possible numbers 1-5
                let current = parseInt(cell.innerText) || 0;
                current = current % BOARD_SIZE + 1;
                cell.innerText = current;
                
                // Also update the numbers array
                numbers[idx] = current;
                checkGuessWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkGuessWin();
}

function checkGuessWin() {
    const status = document.getElementById('arrow-status');
    // Check if each row and column has numbers 1-5 exactly once
    let valid = true;
    
    // Check rows
    for (let r = 0; r < BOARD_SIZE; r++) {
        const rowNums = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (numbers[idx]) rowNums.push(numbers[idx]);
        }
        // Should have 1-5 exactly once
        const sorted = [...rowNums].sort((a, b) => a - b);
        for (let i = 0; i < BOARD_SIZE; i++) {
            if (sorted[i] !== i + 1) valid = false;
        }
    }
    
    // Check columns
    for (let c = 0; c < BOARD_SIZE; c++) {
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
        status.innerText = 'Correct grid! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
