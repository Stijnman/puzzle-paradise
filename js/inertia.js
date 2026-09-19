// Inertia Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const INERTIA_SIZE = 6;
const INERTIA_START = 2 * INERTIA_SIZE + 2;
const INERTIA_INITIAL_GEMS = new Set([
    2 * INERTIA_SIZE + 4,
    4 * INERTIA_SIZE + 4,
    4 * INERTIA_SIZE + 1,
    1 * INERTIA_SIZE + 1
]);
const INERTIA_STOPS = new Set(INERTIA_INITIAL_GEMS);
const INERTIA_MINES = new Set([
    0 * INERTIA_SIZE + 5,
    5 * INERTIA_SIZE + 5,
    0 * INERTIA_SIZE + 0
]);
const INERTIA_WALLS = new Set([
    3 * INERTIA_SIZE + 3,
    1 * INERTIA_SIZE + 4
]);

let inertiaBall = INERTIA_START;
let inertiaGems = new Set();
let inertiaDead = false;

function initInertia() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${INERTIA_SIZE}, 1fr)`;
    board.innerHTML = '';

    inertiaBall = INERTIA_START;
    inertiaGems = new Set(INERTIA_INITIAL_GEMS);
    inertiaDead = false;

    for (let r = 0; r < INERTIA_SIZE; r++) {
        for (let c = 0; c < INERTIA_SIZE; c++) {
            const idx = r * INERTIA_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `inertia-${r}-${c}`;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.onclick = () => moveInertiaToward(idx);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    moveInertiaToward(idx);
                }
            };
            board.appendChild(cell);
        }
    }

    renderInertia();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Click in any of eight directions. The ball keeps sliding until a wall, edge, or stop square.';
    status.style.color = '';
}

function moveInertiaToward(target) {
    if (inertiaDead || inertiaGems.size === 0) return;

    const br = Math.floor(inertiaBall / INERTIA_SIZE);
    const bc = inertiaBall % INERTIA_SIZE;
    const tr = Math.floor(target / INERTIA_SIZE);
    const tc = target % INERTIA_SIZE;
    const dr = Math.sign(tr - br);
    const dc = Math.sign(tc - bc);
    if (dr === 0 && dc === 0) return;

    let row = br;
    let col = bc;
    let moved = false;

    while (true) {
        const nr = row + dr;
        const nc = col + dc;

        if (nr < 0 || nr >= INERTIA_SIZE || nc < 0 || nc >= INERTIA_SIZE) break;
        const next = nr * INERTIA_SIZE + nc;
        if (INERTIA_WALLS.has(next)) break;

        row = nr;
        col = nc;
        moved = true;
        inertiaBall = next;

        if (inertiaGems.has(next)) inertiaGems.delete(next);

        if (INERTIA_MINES.has(next)) {
            inertiaDead = true;
            break;
        }
        if (INERTIA_STOPS.has(next)) break;
    }

    if (!moved) return;
    renderInertia();
    checkInertiaWin();
}

function renderInertia() {
    for (let r = 0; r < INERTIA_SIZE; r++) {
        for (let c = 0; c < INERTIA_SIZE; c++) {
            const idx = r * INERTIA_SIZE + c;
            const cell = document.getElementById(`inertia-${r}-${c}`);
            cell.style.background = 'rgba(8,10,24,.35)';
            cell.style.color = '';

            if (INERTIA_WALLS.has(idx)) {
                cell.innerText = '■';
                cell.style.background = '#0f172a';
                cell.setAttribute('aria-label', 'Wall');
            } else if (idx === inertiaBall) {
                cell.innerText = inertiaDead ? '💥' : '●';
                cell.style.color = inertiaDead ? '#ef4444' : '#22c55e';
                cell.setAttribute('aria-label', inertiaDead ? 'Destroyed ball' : 'Player ball');
            } else if (INERTIA_MINES.has(idx)) {
                cell.innerText = '✹';
                cell.style.color = '#ef4444';
                cell.setAttribute('aria-label', 'Mine');
            } else if (inertiaGems.has(idx)) {
                cell.innerText = '◆';
                cell.style.color = '#38bdf8';
                cell.setAttribute('aria-label', 'Gem');
            } else if (INERTIA_STOPS.has(idx)) {
                cell.innerText = '◌';
                cell.style.color = '#94a3b8';
                cell.setAttribute('aria-label', 'Stop square');
            } else {
                cell.innerText = '';
                cell.setAttribute('aria-label', `Open cell row ${r + 1}, column ${c + 1}`);
            }
        }
    }
}

function checkInertiaWin() {
    const status = document.getElementById('arrow-status');
    if (inertiaDead) {
        status.innerText = 'Mine hit. Start a new puzzle to try again.';
        status.style.color = 'var(--accent-warning)';
    } else if (inertiaGems.size === 0) {
        status.innerText = 'All gems collected without hitting a mine. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = `${inertiaGems.size} gem${inertiaGems.size === 1 ? '' : 's'} remaining.`;
        status.style.color = '';
    }
}
