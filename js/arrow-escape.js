// Arrow Escape Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const ARROW_SIZE = 6;
const DIRS = { '⬆️': [-1, 0], '⬇️': [1, 0], '⬅️': [0, -1], '➡️': [0, 1] };

let arrowGrid = [];

function initArrowGame() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${ARROW_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    arrowGrid = [];

    const arrowTypes = ['⬆️', '⬇️', '⬅️', '➡️'];

    for (let r = 0; r < ARROW_SIZE; r++) {
        arrowGrid[r] = [];
        for (let c = 0; c < ARROW_SIZE; c++) {
            const type = arrowTypes[Math.floor(Math.random() * arrowTypes.length)];
            arrowGrid[r][c] = type;

            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `arrow-${r}-${c}`;
            cell.innerText = type;
            cell.onclick = () => tryClearArrow(r, c);
            board.appendChild(cell);
        }
    }
}

function tryClearArrow(r, c) {
    const dir = arrowGrid[r][c];
    if (!dir) return;

    const [dr, dc] = DIRS[dir];
    let currR = r + dr;
    let currC = c + dc;
    let blocked = false;

    while (currR >= 0 && currR < ARROW_SIZE && currC >= 0 && currC < ARROW_SIZE) {
        if (arrowGrid[currR][currC] !== null && arrowGrid[currR][currC] !== undefined) {
            blocked = true;
            break;
        }
        currR += dr;
        currC += dc;
    }

    if (!blocked) {
        arrowGrid[r][c] = null;
        const cell = document.getElementById(`arrow-${r}-${c}`);
        cell.classList.add('empty');
        cell.innerText = '';
        checkArrowWin();
    }
}

function checkArrowWin() {
    const remaining = arrowGrid.flat().filter(x => x !== null && x !== undefined).length;
    const status = document.getElementById('arrow-status');
    if (remaining === 0) {
        status.innerText = 'Cleared! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
