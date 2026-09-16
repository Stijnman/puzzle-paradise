// Range Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 8;
let ranges = [];

function initRange() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    ranges = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create ranges: each number indicates the length of the contiguous block
    // in that row/column direction
    
    // Simplified: place numbers 1-8 indicating range lengths
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        ranges[i] = numbers[i % numbers.length];
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `range-${r}-${c}`;
            
            if (ranges[idx] > 0 && ranges[idx] <= 8) {
                cell.innerText = String.fromCodePoint(0x1F7E0 + ranges[idx] - 1); // Keycap: 1-8
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '14px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            cell.onclick = () => {
                // Toggle range length
                if (ranges[idx] >= 8) {
                    ranges[idx] = 0;
                    cell.innerText = '';
                } else {
                    ranges[idx]++;
                    cell.innerText = String.fromCodePoint(0x1F7E0 + ranges[idx] - 1);
                    cell.style.color = 'var(--primary)';
                    cell.style.fontWeight = 'bold';
                }
                checkRangeWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkRangeWin();
}

function checkRangeWin() {
    const status = document.getElementById('arrow-status');
    let filled = ranges.filter(r => r > 0).length;
    if (filled > 0) {
        status.innerText = 'Setting ranges...';
        status.style.color = 'var(--accent-warning)';
    }
}
