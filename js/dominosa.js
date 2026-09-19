// Dominosa Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const DOM_ROWS = 5;
const DOM_COLS = 4;
const DOM_SET = [
    [0,0],[0,1],[0,2],[0,3],[1,1],
    [1,2],[1,3],[2,2],[2,3],[3,3]
];
const DOM_VALUES = DOM_SET.flatMap(pair => pair);

let dominosaPartner = [];
let dominosaSelected = null;

function initDominosa() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${DOM_COLS}, 1fr)`;
    board.innerHTML = '';
    dominosaPartner = new Array(DOM_ROWS * DOM_COLS).fill(-1);
    dominosaSelected = null;

    for (let r = 0; r < DOM_ROWS; r++) {
        for (let c = 0; c < DOM_COLS; c++) {
            const idx = r * DOM_COLS + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `dominosa-${r}-${c}`;
            cell.innerText = DOM_VALUES[idx];
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-label', `Number ${DOM_VALUES[idx]}, row ${r + 1}, column ${c + 1}`);
            cell.onclick = () => selectDominosaCell(idx);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectDominosaCell(idx);
                }
            };
            board.appendChild(cell);
        }
    }

    renderDominosa();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Pair adjacent cells into dominoes so every unordered pair from 0–0 through 3–3 is used exactly once.';
    status.style.color = '';
}

function selectDominosaCell(index) {
    if (dominosaPartner[index] >= 0) {
        const other = dominosaPartner[index];
        dominosaPartner[index] = -1;
        dominosaPartner[other] = -1;
        dominosaSelected = null;
        renderDominosa();
        checkDominosaWin();
        return;
    }

    if (dominosaSelected === null) {
        dominosaSelected = index;
        renderDominosa();
        return;
    }

    if (dominosaSelected === index) {
        dominosaSelected = null;
        renderDominosa();
        return;
    }

    if (!dominosaAdjacent(dominosaSelected, index) || dominosaPartner[index] >= 0) {
        dominosaSelected = index;
        renderDominosa();
        return;
    }

    dominosaPartner[dominosaSelected] = index;
    dominosaPartner[index] = dominosaSelected;
    dominosaSelected = null;
    renderDominosa();
    checkDominosaWin();
}

function dominosaAdjacent(a, b) {
    const ar = Math.floor(a / DOM_COLS);
    const ac = a % DOM_COLS;
    const br = Math.floor(b / DOM_COLS);
    const bc = b % DOM_COLS;
    return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

function dominosaPairKey(a, b) {
    return [a, b].sort((x, y) => x - y).join('-');
}

function renderDominosa() {
    const pairColours = new Map();
    let colourIndex = 0;

    for (let i = 0; i < dominosaPartner.length; i++) {
        const partner = dominosaPartner[i];
        if (partner < 0) continue;
        const key = dominosaPairKey(i, partner);
        if (!pairColours.has(key)) pairColours.set(key, colourIndex++);
    }

    for (let r = 0; r < DOM_ROWS; r++) {
        for (let c = 0; c < DOM_COLS; c++) {
            const idx = r * DOM_COLS + c;
            const cell = document.getElementById(`dominosa-${r}-${c}`);
            const partner = dominosaPartner[idx];
            cell.style.background = idx === dominosaSelected
                ? 'rgba(34,197,94,.25)'
                : partner >= 0
                    ? `hsla(${(pairColours.get(dominosaPairKey(idx, partner)) * 47) % 360},65%,55%,.22)`
                    : 'rgba(8,10,24,.35)';
        }
    }
}

function checkDominosaWin() {
    const status = document.getElementById('arrow-status');
    if (dominosaPartner.some(partner => partner < 0)) {
        const paired = dominosaPartner.filter(partner => partner >= 0).length / 2;
        status.innerText = `${paired}/${DOM_SET.length} dominoes paired.`;
        status.style.color = '';
        return;
    }

    const used = new Set();
    for (let i = 0; i < dominosaPartner.length; i++) {
        const partner = dominosaPartner[i];
        if (i > partner) continue;
        const key = dominosaPairKey(DOM_VALUES[i], DOM_VALUES[partner]);
        if (used.has(key)) {
            status.innerText = `Domino ${key} is used more than once.`;
            status.style.color = 'var(--accent-warning)';
            return;
        }
        used.add(key);
    }

    const expected = new Set(DOM_SET.map(pair => dominosaPairKey(...pair)));
    const valid = used.size === expected.size && [...expected].every(key => used.has(key));

    if (valid) {
        status.innerText = 'Every domino pair appears exactly once. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'The board is covered, but the complete domino set is not represented exactly once.';
        status.style.color = 'var(--accent-warning)';
    }
}
