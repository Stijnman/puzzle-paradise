// Keen Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let cages = [];

function initKeen() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    cages = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // KenKen-like puzzle: each cage has a target number and operation
    // The cells in the cage must produce the target using the operation
    
    // Initialize cages with target numbers and operations
    cages = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    
    // Place 8 cages with target numbers
    const cageTargets = [6, +, 3, -, 12, *, 2, +];
    let cageIdx = 0;
    
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        if (cageIdx < cageTargets.length) {
            cages[i] = cageTargets[cageIdx++];
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `keen-${r}-${c}`;
            
            if (cages[idx] && typeof cages[idx] === 'number') {
                cell.innerText = 'T:' + cages[idx];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '12px';
                cell.style.background = 'rgba(37, 99, 235, 0.1)';
            } else {
                // Empty cage cell - put a number
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            cell.onclick = () => {
                // Enter candidate number 1-6
                if (cell.classList.contains('fixed')) return;
                let current = parseInt(cell.innerText) || 0;
                current = current % 6 + 1;
                cell.innerText = current;
            };
            
            board.appendChild(cell);
        }
    }
    
    checkKeenWin();
}

function checkKeenWin() {
    const status = document.getElementById('arrow-status');
    let cagesFilled = cages.filter(c => c && typeof c === 'number').length;
    if (cagesFilled > 0) {
        status.innerText = 'Solving KenKen...';
        status.style.color = 'var(--accent-warning)';
    }
}
