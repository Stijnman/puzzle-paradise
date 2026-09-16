// Fifteen Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 4;
let tiles = [];

function initFifteen() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    tiles = [];

    // Initialize tiles 1-15 with one empty space
    for (let i = 1; i <= 15; i++) {
        tiles.push(i);
    }
    tiles.push(0); // 0 = empty space
    
    // Shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `fifteen-${r}-${c}`;
            
            if (tiles[idx] === 0) {
                // Empty space
                cell.innerText = '';
                cell.classList.add('empty');
            } else {
                cell.innerText = tiles[idx];
                cell.dataset.value = tiles[idx];
            }
            
            cell.onclick = () => {
                // Move tile into empty space
                const emptyIdx = tiles.indexOf(0);
                const [er, ec] = [Math.floor(emptyIdx / BOARD_SIZE), emptyIdx % BOARD_SIZE];
                const [rr, cc] = [r, c];
                
                // Check if adjacent
                if ((Math.abs(rr - er) === 1 && cc === ec) || (Math.abs(cc - ec) === 1 && rr === er)) {
                    // Swap
                    [tiles[emptyIdx], tiles[idx]] = [tiles[idx], tiles[emptyIdx]];
                    initFifteen(); // Re-render
                }
            };
            
            board.appendChild(cell);
        }
    }
    
    checkFifteenWin();
}

function checkFifteenWin() {
    const status = document.getElementById('arrow-status');
    let solved = true;
    for (let i = 0; i < 15; i++) {
        if (tiles[i] !== i + 1) solved = false;
    }
    if (solved && tiles[15] === 0) {
        status.innerText = 'Puzzle Solved!';
        status.style.color = 'var(--accent-success)';
    }
}
