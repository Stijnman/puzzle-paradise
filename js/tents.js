// Tents Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const TENTS_SIZE = 8;
const TENTS_TREES = new Set([
    1 * TENTS_SIZE + 0,
    1 * TENTS_SIZE + 3,
    1 * TENTS_SIZE + 6,
    2 * TENTS_SIZE + 1,
    2 * TENTS_SIZE + 4,
    2 * TENTS_SIZE + 7,
    7 * TENTS_SIZE + 0,
    7 * TENTS_SIZE + 3,
    7 * TENTS_SIZE + 6
]);
const TENTS_SOLUTION = new Set([
    0 * TENTS_SIZE + 0,
    0 * TENTS_SIZE + 3,
    0 * TENTS_SIZE + 6,
    3 * TENTS_SIZE + 1,
    3 * TENTS_SIZE + 4,
    3 * TENTS_SIZE + 7,
    6 * TENTS_SIZE + 0,
    6 * TENTS_SIZE + 3,
    6 * TENTS_SIZE + 6
]);

let tentsPlaced = new Set();
let tentsRowClues = [];
let tentsColClues = [];

function initTents() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `minmax(42px,auto) repeat(${TENTS_SIZE},1fr)`;
    board.innerHTML = '';
    tentsPlaced = new Set();

    tentsRowClues = Array.from({ length: TENTS_SIZE }, (_, row) =>
        [...TENTS_SOLUTION].filter(index => Math.floor(index / TENTS_SIZE) === row).length
    );
    tentsColClues = Array.from({ length: TENTS_SIZE }, (_, col) =>
        [...TENTS_SOLUTION].filter(index => index % TENTS_SIZE === col).length
    );

    const corner = document.createElement('div');
    corner.className = 'grid-cell fixed';
    corner.innerText = '⛺';
    board.appendChild(corner);

    tentsColClues.forEach((clue, col) => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell fixed';
        cell.innerText = String(clue);
        cell.setAttribute('aria-label', `Column ${col + 1} requires ${clue} tents`);
        board.appendChild(cell);
    });

    for (let r = 0; r < TENTS_SIZE; r++) {
        const clue = document.createElement('div');
        clue.className = 'grid-cell fixed';
        clue.innerText = String(tentsRowClues[r]);
        clue.setAttribute('aria-label', `Row ${r + 1} requires ${tentsRowClues[r]} tents`);
        board.appendChild(clue);

        for (let c = 0; c < TENTS_SIZE; c++) {
            const idx = r * TENTS_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `tents-${r}-${c}`;

            if (TENTS_TREES.has(idx)) {
                cell.innerText = '🌳';
                cell.classList.add('fixed');
                cell.setAttribute('aria-label', `Tree row ${r + 1}, column ${c + 1}`);
            } else {
                cell.classList.add('empty');
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.onclick = () => toggleTent(idx);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleTent(idx);
                    }
                };
            }
            board.appendChild(cell);
        }
    }

    renderTents();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Match one tent to each tree, obey row/column counts, and never let tents touch.';
    status.style.color = '';
}

function toggleTent(index) {
    if (tentsPlaced.has(index)) tentsPlaced.delete(index);
    else tentsPlaced.add(index);
    renderTents();
    checkTentsWin();
}

function renderTents() {
    for (let r = 0; r < TENTS_SIZE; r++) {
        for (let c = 0; c < TENTS_SIZE; c++) {
            const idx = r * TENTS_SIZE + c;
            if (TENTS_TREES.has(idx)) continue;
            const cell = document.getElementById(`tents-${r}-${c}`);
            const hasTent = tentsPlaced.has(idx);
            cell.innerText = hasTent ? '⛺' : '';
            cell.classList.toggle('empty', !hasTent);
            cell.style.background = hasTent ? 'rgba(245,158,11,.2)' : 'rgba(8,10,24,.35)';
            cell.setAttribute(
                'aria-label',
                `${hasTent ? 'Tent' : 'Empty'} row ${r + 1}, column ${c + 1}`
            );
        }
    }
}

function tentsTouch() {
    for (const index of tentsPlaced) {
        const row = Math.floor(index / TENTS_SIZE);
        const col = index % TENTS_SIZE;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r < 0 || r >= TENTS_SIZE || c < 0 || c >= TENTS_SIZE) continue;
                if (tentsPlaced.has(r * TENTS_SIZE + c)) return true;
            }
        }
    }
    return false;
}

function tentAdjacentTrees(index) {
    const row = Math.floor(index / TENTS_SIZE);
    const col = index % TENTS_SIZE;
    const result = [];

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= TENTS_SIZE || c < 0 || c >= TENTS_SIZE) continue;
        const next = r * TENTS_SIZE + c;
        if (TENTS_TREES.has(next)) result.push(next);
    }
    return result;
}

function tentsHavePerfectTreeMatching() {
    if (tentsPlaced.size !== TENTS_TREES.size) return false;
    const matching = new Map();

    function assign(tent, seen) {
        for (const tree of tentAdjacentTrees(tent)) {
            if (seen.has(tree)) continue;
            seen.add(tree);
            if (!matching.has(tree) || assign(matching.get(tree), seen)) {
                matching.set(tree, tent);
                return true;
            }
        }
        return false;
    }

    return [...tentsPlaced].every(tent => assign(tent, new Set()));
}

function checkTentsWin() {
    const rowCounts = Array.from({ length: TENTS_SIZE }, (_, row) =>
        [...tentsPlaced].filter(index => Math.floor(index / TENTS_SIZE) === row).length
    );
    const colCounts = Array.from({ length: TENTS_SIZE }, (_, col) =>
        [...tentsPlaced].filter(index => index % TENTS_SIZE === col).length
    );

    const countsValid =
        rowCounts.every((count, row) => count === tentsRowClues[row]) &&
        colCounts.every((count, col) => count === tentsColClues[col]);
    const noTouching = !tentsTouch();
    const matchingValid = tentsHavePerfectTreeMatching();

    const status = document.getElementById('arrow-status');
    if (countsValid && noTouching && matchingValid) {
        status.innerText = 'Every tree has its tent and all counts match. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (!noTouching) {
        status.innerText = 'Tents may not touch, even diagonally.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = `${tentsPlaced.size}/${TENTS_TREES.size} tents placed. Match the row and column clues.`;
        status.style.color = '';
    }
}
