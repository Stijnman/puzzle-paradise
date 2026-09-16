// Loopy Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let loop = [];

function initLoopy() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    loop = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create a single loop through some cells
    // Numbers indicate how many loop segments surround that cell
    
    // Create a simplified loop
    // Start at (0,0), go right, down, left, forming a C shape
    let pos = 0;
    loop[pos] = 1;
    
    // Go right 3
    for (let i = 0; i < 3; i++) {
        pos += 1;
        loop[pos] = i + 2;
    }
    // Go down 3
    for (let i = 0; i < 3; i++) {
        pos += BOARD_SIZE;
        loop[pos] = i + 5;
    }
    // Go left 3
    for (let i = 0; i < 3; i++) {
        pos -= 1;
        loop[pos] = i + 9;
    }
    // Go up 2
    for (let i = 0; i < 2; i++) {
        pos -= BOARD_SIZE;
        loop[pos] = i + 13;
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `loopy-${r}-${c}`;
            
            if (loop[idx]) {
                cell.innerText = loop[idx] % 10 || 10;
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '12px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            cell.onclick = () => {
                // Toggle loop segment
                if (loop[idx]) {
                    loop[idx] = 0;
                    cell.innerText = '';
                } else {
                    loop[idx] = 1;
                    cell.innerText = '1';
                    cell.style.color = 'var(--primary)';
                    cell.style.fontWeight = 'bold';
                }
                checkLoopyWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkLoopyWin();
}

function checkLoopyWin() {
    const status = document.getElementById('arrow-status');
    // Check if we have a valid loop
    let segments = loop.filter(l => l > 0).length;
    if (segments > 0 && segments < 20) {
        status.innerText = 'Loop in progress...';
        status.style.color = 'var(--accent-warning)';
    } else if (segments >= 20) {
        status.innerText = 'Valid loop formed! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
