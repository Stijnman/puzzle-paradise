// Hitori / Singles Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const HITORI_SIZE = 5;
const HITORI_VALUES = [
    1, 1, 3, 4, 5,
    2, 3, 4, 2, 1,
    4, 4, 5, 1, 2,
    4, 5, 4, 2, 3,
    5, 1, 2, 3, 1
];

let hitoriShaded = new Set();

function initHitori() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${HITORI_SIZE}, 1fr)`;
    board.innerHTML = '';
    hitoriShaded = new Set();

    for (let r = 0; r < HITORI_SIZE; r++) {
        for (let c = 0; c < HITORI_SIZE; c++) {
            const idx = r * HITORI_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `hitori-${r}-${c}`;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.onclick = () => toggleHitoriCell(idx);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleHitoriCell(idx);
                }
            };
            board.appendChild(cell);
        }
    }

    renderHitori();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Shade duplicates so visible numbers are unique in every row and column; shaded cells cannot touch.';
    status.style.color = '';
}

function toggleHitoriCell(index) {
    if (hitoriShaded.has(index)) hitoriShaded.delete(index);
    else hitoriShaded.add(index);
    renderHitori();
    checkHitoriWin();
}

function renderHitori() {
    for (let r = 0; r < HITORI_SIZE; r++) {
        for (let c = 0; c < HITORI_SIZE; c++) {
            const idx = r * HITORI_SIZE + c;
            const cell = document.getElementById(`hitori-${r}-${c}`);
            const shaded = hitoriShaded.has(idx);
            cell.innerText = HITORI_VALUES[idx];
            cell.style.background = shaded ? '#0f172a' : 'rgba(8,10,24,.35)';
            cell.style.color = shaded ? '#94a3b8' : 'var(--primary)';
            cell.classList.toggle('shaded', shaded);
            cell.setAttribute(
                'aria-label',
                `Number ${HITORI_VALUES[idx]}, row ${r + 1}, column ${c + 1}, ${shaded ? 'shaded' : 'visible'}`
            );
        }
    }
}

function hitoriVisibleNumbersUnique() {
    for (let r = 0; r < HITORI_SIZE; r++) {
        const seen = new Set();
        for (let c = 0; c < HITORI_SIZE; c++) {
            const idx = r * HITORI_SIZE + c;
            if (hitoriShaded.has(idx)) continue;
            const value = HITORI_VALUES[idx];
            if (seen.has(value)) return false;
            seen.add(value);
        }
    }

    for (let c = 0; c < HITORI_SIZE; c++) {
        const seen = new Set();
        for (let r = 0; r < HITORI_SIZE; r++) {
            const idx = r * HITORI_SIZE + c;
            if (hitoriShaded.has(idx)) continue;
            const value = HITORI_VALUES[idx];
            if (seen.has(value)) return false;
            seen.add(value);
        }
    }
    return true;
}

function hitoriShadedTouch() {
    for (const idx of hitoriShaded) {
        const r = Math.floor(idx / HITORI_SIZE);
        const c = idx % HITORI_SIZE;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= HITORI_SIZE || nc < 0 || nc >= HITORI_SIZE) continue;
            if (hitoriShaded.has(nr * HITORI_SIZE + nc)) return true;
        }
    }
    return false;
}

function hitoriWhiteConnected() {
    const white = [];
    for (let i = 0; i < HITORI_SIZE * HITORI_SIZE; i++) {
        if (!hitoriShaded.has(i)) white.push(i);
    }
    if (!white.length) return false;

    const reached = new Set([white[0]]);
    const queue = [white[0]];
    while (queue.length) {
        const idx = queue.shift();
        const r = Math.floor(idx / HITORI_SIZE);
        const c = idx % HITORI_SIZE;

        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= HITORI_SIZE || nc < 0 || nc >= HITORI_SIZE) continue;
            const next = nr * HITORI_SIZE + nc;
            if (hitoriShaded.has(next) || reached.has(next)) continue;
            reached.add(next);
            queue.push(next);
        }
    }

    return reached.size === white.length;
}

function checkHitoriWin() {
    const unique = hitoriVisibleNumbersUnique();
    const separate = !hitoriShadedTouch();
    const connected = hitoriWhiteConnected();
    const status = document.getElementById('arrow-status');

    if (unique && separate && connected) {
        status.innerText = 'Rows and columns are unique and all white cells remain connected. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (!separate) {
        status.innerText = 'Two shaded cells touch along an edge.';
        status.style.color = 'var(--accent-warning)';
    } else if (!connected) {
        status.innerText = 'The remaining white cells are not one connected region.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = 'Some visible row or column still contains a duplicate number.';
        status.style.color = '';
    }
}
