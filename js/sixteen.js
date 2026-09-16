// Sixteen / Sixteen Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 4;
let grid = [];

function initSixteen() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Sixteen: fill the 4x4 grid with numbers 1-4
    // Each row and column must have all numbers 1-4
    // (A smaller version of Sudoku / Latin square)
    
    // Initialize Latin square 4x4
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            grid[r * BOARD_SIZE + c] = (r * BOARD_SIZE + c + r) % BOARD_SIZE + 1;
        }
    }
    
    // Remove some for clues (leave 8 clues)
    const cluePositions = [[0,0],[1,1],[2,2],[3,3],[0,3],[3,0],[1,2],[2,1]];
    for (const [r, c] of cluePositions) {
        grid[r * BOARD_SIZE + c] = 0;
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `sixteen-${r}-${c}`;
            
            if (grid[idx]) {
                cell.innerText = grid[idx];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.dataset.clue = 'true';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            cell.onclick = () => {
                // Enter number 1-4
                if (cell.classList.contains('fixed')) return;
                let current = parseInt(cell.innerText) || 0;
                current = current % BOARD_SIZE + 1;
                cell.innerText = current;
                grid[idx] = current;
                checkSixteenWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkSixteenWin();
}

function checkSixteenWin() {
    const status = document.getElementById('arrow-status');
    // Check rows and columns for 1-4
    let valid = true;
    
    // Check rows
    for (let r = 0; r < BOARD_SIZE && valid; r++) {
        const rowNums = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (grid[idx]) rowNums.push(grid[idx]);
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
            if (grid[idx]) colNums.push(grid[idx]);
        }
        const sorted = [...colNums].sort((a, b) => a - b);
        for (let i = 0; i < BOARD_SIZE; i++) {
            if (sorted[i] !== i + 1) valid = false;
        }
    }
    
    if (valid) {
        status.innerText = 'Valid grid! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
