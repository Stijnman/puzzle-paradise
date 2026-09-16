// Cube Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 5;
let faces = [];

function initCube() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    faces = [];

    // Initialize 6 faces with numbers 1-6
    const faceNumbers = [1, 2, 3, 4, 5, 6];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        faces.push(0); // 0 = empty
    }

    // Place face numbers randomly
    const placed = [];
    while (placed.length < 6) {
        const idx = Math.floor(Math.random() * faceNumbers.length);
        const val = faceNumbers[idx];
        if (!placed.some(p => p === val)) {
            placed.push(val);
            // Place on board
            const pos = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
            const r = Math.floor(pos / BOARD_SIZE);
            const c = pos % BOARD_SIZE;
            faces[r * BOARD_SIZE + c] = val;
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `cube-${r}-${c}`;

            if (faces[idx]) {
                cell.innerText = faces[idx];
                cell.style.fontWeight = 'bold';
                cell.style.color = 'var(--primary)';
            }

            cell.onclick = () => {
                // Cycle through faces or clear
                if (!faces[idx]) {
                    faces[idx] = 1;
                    cell.innerText = '1';
                } else {
                    faces[idx] = 0;
                    cell.innerText = '';
                }
                checkCubeWin();
            };

            board.appendChild(cell);
        }
    }
}

function checkCubeWin() {
    const status = document.getElementById('arrow-status');
    let placed = faces.filter(f => f > 0).length;
    if (placed === 6) {
        status.innerText = 'All 6 faces placed! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
