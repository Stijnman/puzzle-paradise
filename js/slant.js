// Slant / Slalom Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let slants = [];

function initSlant() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    slants = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create slant lines: each number 0-2 indicates the number of slants in that row/column
    // Slants are / or \ that don't touch

    // Initialize with row/column clues
    // For simplicity, just place slash/backslash indicators
    slants = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Place some slashes randomly
    for (let i = 0; i < BOARD_SIZE; i++) {
        const r = Math.floor(Math.random() * BOARD_SIZE);
        const c = Math.floor(Math.random() * BOARD_SIZE);
        if (slants[r * BOARD_SIZE + c] === 0) {
            slants[r * BOARD_SIZE + c] = Math.random() > 0.5 ? 1 : -1; // 1=\, -1=/
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `slant-${r}-${c}`;

            if (slants[idx] === 1) {
                cell.innerText = '\\';
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '20px';
            } else if (slants[idx] === -1) {
                cell.innerText = '/';
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '20px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Cycle: / -> \ -> empty
                if (slants[idx] === -1) {
                    slants[idx] = 1;
                    cell.innerText = '\\';
                    cell.style.color = 'var(--primary)';
                } else if (slants[idx] === 1) {
                    slants[idx] = 0;
                    cell.innerText = '';
                } else {
                    slants[idx] = -1;
                    cell.innerText = '/';
                    cell.style.color = 'var(--primary)';
                }
                checkSlantWin();
            };

            board.appendChild(cell);
        }
    }

    checkSlantWin();
}

function checkSlantWin() {
    const status = document.getElementById('arrow-status');
    let slantsPlaced = slants.filter(s => s !== 0).length;
    if (slantsPlaced > 0) {
        status.innerText = 'Slants placed...';
        status.style.color = 'var(--accent-warning)';
    }
}
