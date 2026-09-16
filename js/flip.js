// Flip / Signpost Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let path = [];

function initFlip() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    path = [];

    // Create a path from (0,0) to (n-1,n-1) that doesn't cross itself
    // The path number indicates the step number
    path = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    
    // Create a simple snake path
    let pos = 0;
    let dir = 0; // 0:right, 1:down, 2:left, 3:up
    const dr = [0, 1, 0, -1];
    const dc = [1, 0, -1, 0];
    
    path[pos] = 1; // Start at 1
    
    while (pos < BOARD_SIZE * BOARD_SIZE - 1) {
        const nextPos = pos + dr[dir] * BOARD_SIZE + dc[dir];
        const r = Math.floor(nextPos / BOARD_SIZE);
        const c = nextPos % BOARD_SIZE;
        
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && path[nextPos] === 0) {
            pos = nextPos;
            path[pos] = Math.floor(pos / BOARD_SIZE) + 1;
        } else {
            dir = (dir + 1) % 4; // Turn
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `flip-${r}-${c}`;
            
            if (path[idx]) {
                cell.innerText = path[idx] % 10 || 10; // Show last digit
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            cell.onclick = () => {
                // Toggle direction/rotation marker
                if (path[idx]) {
                    path[idx] = 0;
                    cell.innerText = '';
                    cell.classList.remove('selected');
                } else {
                    path[idx] = (path[idx] || 0) + 1;
                    if (path[idx] > 9) path[idx] = 1;
                    cell.innerText = path[idx];
                    cell.classList.add('selected');
                }
                checkFlipWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkFlipWin();
}

function checkFlipWin() {
    const status = document.getElementById('arrow-status');
    // Check if path goes from start to end
    let hasStart = false, hasEnd = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (r === 0 && c === 0 && path[0]) hasStart = true;
            if (r === BOARD_SIZE-1 && c === BOARD_SIZE-1 && path[(BOARD_SIZE-1)*BOARD_SIZE+(BOARD_SIZE-1)]) hasEnd = true;
        }
    }
    if (hasStart && hasEnd) {
        status.innerText = 'Path connected! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
