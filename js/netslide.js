// NetSlide Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let slides = [];

function initNetSlide() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    slides = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // NetSlide: slide rows/columns to connect the power source
    // The goal is to create a continuous path from the start
    
    // Initialize grid with some patterns
    slides = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    
    // Create a simple path from top-left to bottom-right
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const r = Math.floor(i / BOARD_SIZE);
        const c = i % BOARD_SIZE;
        // Simple: fill row by row
        slides[i] = (r === 0 && c < 3) || (c === BOARD_SIZE - 1 && r > 0 && r < BOARD_SIZE - 1) || (r === BOARD_SIZE - 1 && c >= 2) ? 1 : 0;
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `netslide-${r}-${c}`;
            
            if (slides[idx]) {
                cell.innerText = '→';
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }
            
            cell.onclick = () => {
                // Toggle slide direction
                if (slides[idx]) {
                    slides[idx] = 0;
                    cell.innerText = '';
                } else {
                    slides[idx] = 1;
                    cell.innerText = '→';
                    cell.style.color = 'var(--primary)';
                }
                checkNetSlideWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkNetSlideWin();
}

function checkNetSlideWin() {
    const status = document.getElementById('arrow-status');
    let connected = slides.filter(s => s > 0).length;
    if (connected > 0) {
        status.innerText = 'Connecting path...';
        status.style.color = 'var(--accent-warning)';
    }
}
