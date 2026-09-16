// Inertia Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let masses = [];

function initInertia() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    masses = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Place weights and determine direction of fall
    // Numbers indicate weight values; arrow direction shows fall direction
    
    // Initialize with random weights 1-3
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        masses[i] = Math.floor(Math.random() * 3) + 1;
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `inertia-${r}-${c}`;
            
            if (masses[idx] > 0 && masses[idx] <= 3) {
                // Arrow direction: 1=↑, 2→, 3↓ (simplified)
                const arrowChars = ['↑', '→', '↓'];
                cell.innerText = arrowChars[masses[idx] - 1];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            cell.onclick = () => {
                // Rotate arrow direction
                if (masses[idx]) {
                    masses[idx] = masses[idx] % 3 + 1;
                } else {
                    masses[idx] = 1;
                }
                cell.innerText = masses[idx] === 1 ? '↑' : masses[idx] === 2 ? '→' : '↓';
                cell.style.color = 'var(--primary)';
                checkInertiaWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkInertiaWin();
}

function checkInertiaWin() {
    const status = document.getElementById('arrow-status');
    let placed = masses.filter(m => m > 0).length;
    if (placed > 0) {
        status.innerText = 'Setting weights...';
        status.style.color = 'var(--accent-warning)';
    }
}
