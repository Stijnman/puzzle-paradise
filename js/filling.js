// Filling / Fillomino Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const FILL_SIZE = 5;
const FILL_TARGET = [
    6,6,6,4,4,
    6,6,6,4,4,
    5,5,5,5,5,
    3,3,3,2,2,
    5,5,5,5,5
];
const FILL_FIXED = new Set([0, 3, 10, 15, 18, 20]);
let fillValues = [];

function initFilling() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${FILL_SIZE}, 1fr)`;
    board.innerHTML = '';
    fillValues = FILL_TARGET.map((value, index) => FILL_FIXED.has(index) ? value : 0);

    for (let r = 0; r < FILL_SIZE; r++) {
        for (let c = 0; c < FILL_SIZE; c++) {
            const idx = r * FILL_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `filling-${r}-${c}`;

            if (FILL_FIXED.has(idx)) {
                cell.classList.add('fixed');
            } else {
                cell.classList.add('empty');
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.onclick = () => cycleFillingCell(idx);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        cycleFillingCell(idx);
                    }
                };
            }

            board.appendChild(cell);
        }
    }

    renderFilling();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Fill every cell. Each connected region of a number N must contain exactly N cells.';
    status.style.color = '';
}

function cycleFillingCell(index) {
    if (FILL_FIXED.has(index)) return;
    fillValues[index] = (fillValues[index] + 1) % 7;
    renderFilling();
    checkFillingWin();
}

function renderFilling() {
    for (let r = 0; r < FILL_SIZE; r++) {
        for (let c = 0; c < FILL_SIZE; c++) {
            const idx = r * FILL_SIZE + c;
            const cell = document.getElementById(`filling-${r}-${c}`);
            const value = fillValues[idx];
            cell.innerText = value || '';
            cell.classList.toggle('empty', value === 0 && !FILL_FIXED.has(idx));
            cell.style.background = FILL_FIXED.has(idx)
                ? 'rgba(99,102,241,.16)'
                : value
                    ? `hsla(${value * 45},65%,55%,.18)`
                    : 'rgba(8,10,24,.35)';
            cell.setAttribute(
                'aria-label',
                `${FILL_FIXED.has(idx) ? 'Fixed ' : ''}${value || 'empty'} cell row ${r + 1}, column ${c + 1}`
            );
        }
    }
}

function fillingComponent(start, seen) {
    const value = fillValues[start];
    const component = [];
    const queue = [start];
    seen.add(start);

    while (queue.length) {
        const idx = queue.shift();
        component.push(idx);
        const r = Math.floor(idx / FILL_SIZE);
        const c = idx % FILL_SIZE;

        for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= FILL_SIZE || nc < 0 || nc >= FILL_SIZE) continue;
            const next = nr * FILL_SIZE + nc;
            if (seen.has(next) || fillValues[next] !== value) continue;
            seen.add(next);
            queue.push(next);
        }
    }
    return component;
}

function checkFillingWin() {
    const status = document.getElementById('arrow-status');

    if (fillValues.some(value => value === 0)) {
        const remaining = fillValues.filter(value => value === 0).length;
        status.innerText = `${remaining} cell${remaining === 1 ? '' : 's'} still empty.`;
        status.style.color = '';
        return;
    }

    const seen = new Set();
    for (let i = 0; i < fillValues.length; i++) {
        if (seen.has(i)) continue;
        const component = fillingComponent(i, seen);
        if (component.length !== fillValues[i]) {
            status.innerText = `A region labelled ${fillValues[i]} currently has ${component.length} cells.`;
            status.style.color = 'var(--accent-warning)';
            return;
        }
    }

    status.innerText = 'Every numbered region has exactly the required size. Puzzle solved!';
    status.style.color = 'var(--accent-success)';
}
