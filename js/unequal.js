// Unequal / Unequal Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let grid = [];

function initUnequal() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Unequal: fill grid with numbers 1-6
    // Adjacent cells (horiz/vert) must have unequal values
    // Some cells are pre-filled
    
    // Initialize with a valid unequal grid
    // Simple Latin square approach with inequality
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            // Just cycle 1-6 to ensure adjacent are different
            grid[r * BOARD_SIZE + c] = (c % BOARD_SIZE) + 1;
        }
    }
    
    // Ensure vertical inequality too (simple: shift each row)
    for (let r = 1; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            grid[r * BOARD_SIZE + c] = ((grid[(r-1) * BOARD_SIZE + c] - 2) % BOARD_SIZE) + 1;
        }
    }
    
    // Remove some for clues
    const cluePositions = [[0,0],[1,1],[2,2],[3,3],[4,4],[5,5]];
    for (const [r, c] of cluePositions) {
        grid[r * BOARD_SIZE + c] = 0;
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `unequal-${r}-${c}`;
            
            if (grid[idx]) {
                cell.innerText = grid[idx];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
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
                grid[idx] = current;
                checkUnequalWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkUnequalWin();
}

function checkUnequalWin() {
    const status = document.getElementById('arrow-status');
    // Check all adjacent cells are unequal
    let valid = true;
    
    for (let r = 0; r < BOARD_SIZE && valid; r++) {
        for (let c = 0; c < BOARD_SIZE && valid; c++) {
            const idx = r * BOARD_SIZE + c;
            if (!grid[idx]) continue;
            
            // Check right neighbor
            if (c + 1 < BOARD_SIZE && grid[idx] && grid[r * BOARD_SIZE + c + 1] && grid[idx] === grid[r * BOARD_SIZE + c + 1]) valid = false;
            // Check bottom neighbor
            if (r + 1 < BOARD_SIZE && grid[idx] && grid[(r+1) * BOARD_SIZE + c] && grid[idx] === grid[(r+1) * BOARD_SIZE + c]) valid = false;
        }
    }
    
    if (valid) {
        status.innerText = 'All unequal! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
