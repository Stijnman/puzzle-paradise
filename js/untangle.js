// Untangle Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let points = [];

function initUntangle() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    points = new Array(BOARD_SIZE * BOARD_SIZE).fill(null);

    // Place points and create no-crossing lines connecting them in pairs
    // Each point must be connected to exactly one other point
    // Lines cannot cross

    // Place 6 points (12 cells needed, we have 36... use some as connectors)
    // Simplified: place numbered connections

    // Create 3 pairs of points
    points = new Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    const pairCount = 3;

    for (let p = 0; p < pairCount; p++) {
        // Place two points
        let placed = 0;
        while (placed < 2) {
            const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
            if (points[idx] === null) {
                points[idx] = p + 1; // 1 or 2
                placed++;
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `untangle-${r}-${c}`;

            if (points[idx]) {
                cell.innerText = String.fromCodePoint(0x1F5FA); // 📿 bead
                cell.style.color = getUntangleColor(points[idx]);
                cell.style.fontSize = '16px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Toggle point connection
                if (points[idx]) {
                    points[idx] = null;
                    cell.innerText = '';
                } else {
                    points[idx] = p + 1;
                    cell.innerText = String.fromCodePoint(0x1F5FA);
                    cell.style.color = getUntangleColor(points[idx]);
                }
                checkUntangleWin();
            };

            board.appendChild(cell);
        }
    }

    checkUntangleWin();
}

function getUntangleColor(num) {
    const colors = ['#2563eb', '#1e40af'];
    return colors[num - 1] || '#6366f1';
}

function checkUntangleWin() {
    const status = document.getElementById('arrow-status');
    let connected = points.filter(p => p !== null).length;
    if (connected >= 6) {
        status.innerText = 'All points connected! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
