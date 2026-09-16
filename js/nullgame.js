// Null Game Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 5;
let grid = [];

function initNullGame() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill('null');

    // Null Game: empty game, just a placeholder
    // No rules - just displays nothing special
    
    // Create empty grid
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `nullgame-${r}-${c}`;
            cell.innerText = '';
            cell.classList.add('empty');
            cell.style.background = 'transparent';
            
            cell.onclick = () => {
                // No-op
                checkNullGameWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkNullGameWin();
}

function checkNullGameWin() {
    const status = document.getElementById('arrow-status');
    status.innerText = 'Null game selected';
    status.style.color = 'var(--accent-warning)';
}
