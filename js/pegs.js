// Pegs / Peg Solitaire Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let board = [];

function initPegs() {
    const gridBoard = document.getElementById('arrow-board');
    gridBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    gridBoard.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    board = new Array(BOARD_SIZE * BOARD_SIZE).fill('peg'); // 'peg', 'empty', 'removed'

    // Initialize English peg solitaire board shape
    // Empty center, pegs everywhere else
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            // Only certain positions are valid for solitaire
            if (r === 0 && c === 0 || r === 0 && c === 6 || r === 6 && c === 0 || r === 6 && c === 6) {
                // Corners - no pegs
                board[r * BOARD_SIZE + c] = 'empty';
            } else if (r === 3 && c === 3) {
                // Center - empty
                board[r * BOARD_SIZE + c] = 'empty';
            } else if (r < 3 && c < 3 || r < 3 && c > 3 || r > 3 && c < 3 || r > 3 && c > 3) {
                // Edges and corners of the 7x7 grid
                board[r * BOARD_SIZE + c] = 'peg';
            } else {
                board[r * BOARD_SIZE + c] = 'peg';
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `pegs-${r}-${c}`;
            
            if (board[idx] === 'peg') {
                cell.innerText = '●';
                cell.style.color = 'var(--primary)';
                cell.style.fontSize = '18px';
                cell.onclick = () => makeMove(r, c);
            } else if (board[idx] === 'empty') {
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            gridBoard.appendChild(cell);
        }
    }
    
    checkPegsWin();
}

function makeMove(r, c) {
    // Make a peg move: jump over adjacent peg into empty space
    const idx = r * BOARD_SIZE + c;
    if (board[idx] !== 'peg') return;
    
    // Try four directions: up, down, left, right
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dr, dc] of directions) {
        const mr = r + dr; // midpoint
        const mc = c + dc;
        const er = r + 2 * dr; // endpoint
        const ec = c + 2 * dc;
        
        const midIdx = mr * BOARD_SIZE + mc;
        const endIdx = er * BOARD_SIZE + ec;
        
        if (midIdx >= 0 && midIdx < BOARD_SIZE * BOARD_SIZE && 
            endIdx >= 0 && endIdx < BOARD_SIZE * BOARD_SIZE &&
            board[midIdx] === 'peg' && board[endIdx] === 'empty') {
            
            // Make the move
            board[idx] = 'removed';
            board[midIdx] = 'empty';
            board[endIdx] = 'peg';
            
            // Re-render
            initPegs();
            return;
        }
    }
}

function checkPegsWin() {
    const status = document.getElementById('arrow-status');
    let pegsRemaining = board.filter(b => b === 'peg').length;
    if (pegsRemaining <= 1) {
        status.innerText = 'One peg remaining! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
