// Fillomino Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let cells = [];

function initFilling() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    cells = [];

    // Initialize cells with random sizes
    // Fillomino: each number represents a area of that many connected cells
    // All cells with the same number must form a connected group of that size
    // No two groups of the same number can touch
    
    // Simplified: place numbers 1-5 in the grid
    cells = [];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        cells.push(0);
    }
    
    // Place some fixed clues
    const clues = [
        [0, 3], [2, 0], [4, 6], [1, 5], [3, 7], [6, 1], [5, 4],
        [7, 2], [1, 0], [3, 2], [5, 4], [7, 6], [2, 1], [4, 3]
    ];
    
    for (let [r, c] of clues) {
        if (r < BOARD_SIZE && c < BOARD_SIZE) {
            cells[r * BOARD_SIZE + c] = Math.ceil(Math.random() * 5) + 1;
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `filling-${r}-${c}`;
            
            if (cells[idx]) {
                cell.innerText = String.fromCodePoint(0x2460 + cells[idx] - 1); // ☐-☑ numbers
                cell.style.fontSize = '14px';
                cell.style.color = 'var(--primary)';
            } else {
                cell.innerText = '';
            }
            
            cell.onclick = () => {
                // Toggle number size
                if (cells[idx]) {
                    cells[idx] = 0;
                    cell.innerText = '';
                } else {
                    cells[idx] = Math.ceil(Math.random() * 5) + 1;
                    cell.innerText = String.fromCodePoint(0x2460 + cells[idx] - 1);
                }
                checkFillingWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkFillingWin();
}

function checkFillingWin() {
    const status = document.getElementById('arrow-status');
    let filled = cells.filter(c => c > 0).length;
    if (filled > 0) {
        status.innerText = 'Areas filling grid!';
        status.style.color = 'var(--accent-success)';
    }
}
