// Rect / Rectangular Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let rectangles = [];

function initRect() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    rectangles = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create rectangles: each numbered cell is part of a rectangle of that area
    // All cells with the same number form a rectangle

    // Simplified: place rectangle area numbers
    rectangles = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Place rectangle area numbers 1-8
    const areas = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        rectangles[i] = areas[i % areas.length];
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `rect-${r}-${c}`;

            if (rectangles[idx] > 0 && rectangles[idx] <= 8) {
                cell.innerText = String.fromCodePoint(0x25A0); // ▓ block
                cell.style.background = getRectColor(rectangles[idx]);
                cell.style.color = 'white';
                cell.style.fontSize = '12px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Cycle rectangle area
                if (rectangles[idx] >= 8) {
                    rectangles[idx] = 0;
                    cell.innerText = '';
                } else {
                    rectangles[idx]++;
                    cell.style.background = getRectColor(rectangles[idx]);
                    cell.innerText = String.fromCodePoint(0x25A0);
                    cell.style.color = 'white';
                }
                checkRectWin();
            };

            board.appendChild(cell);
        }
    }

    checkRectWin();
}

function getRectColor(area) {
    const colors = ['#2563eb', '#1e40af', '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e4e6f1'];
    return colors[area - 1] || '#6366f1';
}

function checkRectWin() {
    const status = document.getElementById('arrow-status');
    let filled = rectangles.filter(r => r > 0).length;
    if (filled > 0) {
        status.innerText = 'Drawing rectangles...';
        status.style.color = 'var(--accent-warning)';
    }
}
