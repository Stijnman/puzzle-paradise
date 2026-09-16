// Towers / Tower Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let heights = [];

function initTowers() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    heights = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Towers: Skyscraper puzzle - numbers 1-6 indicate building heights
    // Edge numbers tell how many buildings are visible
    
    // Initialize with building heights 1-6
    heights = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        heights[i] = Math.floor(Math.random() * BOARD_SIZE) + 1;
    }
    
    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `towers-${r}-${c}`;
            
            if (heights[idx] > 0 && heights[idx] <= 6) {
                cell.innerText = heights[idx];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            cell.onclick = () => {
                // Change building height
                if (heights[idx] >= 6) {
                    heights[idx] = 0;
                    cell.innerText = '';
                } else {
                    heights[idx]++;
                    cell.innerText = heights[idx];
                    cell.style.color = 'var(--primary)';
                    cell.style.fontWeight = 'bold';
                }
                checkTowersWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkTowersWin();
}

function checkTowersWin() {
    const status = document.getElementById('arrow-status');
    let filled = heights.filter(h => h > 0).length;
    if (filled > 0) {
        status.innerText = 'Placing towers...';
        status.style.color = 'var(--accent-warning)';
    }
}
