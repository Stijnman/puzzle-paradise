// Signpost Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const SIGNPOST_SIZE = 6;
let signpostArrows = [];
let signpostNext = [];
let signpostPrev = [];
let signpostSelected = null;

function signpostSolutionOrder() {
    const order = [];
    for (let row = 0; row < SIGNPOST_SIZE; row++) {
        const cols = Array.from({ length: SIGNPOST_SIZE }, (_, col) => col);
        if (row % 2) cols.reverse();
        for (const col of cols) order.push(row * SIGNPOST_SIZE + col);
    }
    return order;
}

function signpostDirection(from, to) {
    const fr = Math.floor(from / SIGNPOST_SIZE), fc = from % SIGNPOST_SIZE;
    const tr = Math.floor(to / SIGNPOST_SIZE), tc = to % SIGNPOST_SIZE;
    const dr = Math.sign(tr - fr), dc = Math.sign(tc - fc);
    const symbols = {
        '-1,-1':'↖','-1,0':'↑','-1,1':'↗',
        '0,-1':'←','0,1':'→',
        '1,-1':'↙','1,0':'↓','1,1':'↘'
    };
    return { dr, dc, symbol: symbols[`${dr},${dc}`] };
}

function initSignpost() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${SIGNPOST_SIZE},1fr)`;
    board.innerHTML = '';

    const order = signpostSolutionOrder();
    signpostArrows = new Array(order.length).fill(null);
    signpostNext = new Array(order.length).fill(-1);
    signpostPrev = new Array(order.length).fill(-1);
    signpostSelected = null;

    for (let step = 0; step < order.length - 1; step++) {
        signpostArrows[order[step]] = signpostDirection(order[step], order[step + 1]);
    }

    for (let r = 0; r < SIGNPOST_SIZE; r++) {
        for (let c = 0; c < SIGNPOST_SIZE; c++) {
            const idx = r * SIGNPOST_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `signpost-${r}-${c}`;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => selectSignpost(idx);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectSignpost(idx);
                }
            };
            board.appendChild(cell);
        }
    }

    renderSignpost();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Link every square into one chain from 1 to 36; each successor must lie along the source arrow.';
    status.style.color = '';
}

function signpostCanPoint(from, to) {
    if (from === to || !signpostArrows[from]) return false;
    const expected = signpostArrows[from];
    const actual = signpostDirection(from, to);
    if (actual.dr !== expected.dr || actual.dc !== expected.dc) return false;

    const fr = Math.floor(from / SIGNPOST_SIZE), fc = from % SIGNPOST_SIZE;
    const tr = Math.floor(to / SIGNPOST_SIZE), tc = to % SIGNPOST_SIZE;
    return expected.dr === 0 || expected.dc === 0 ||
        Math.abs(tr - fr) === Math.abs(tc - fc);
}

function selectSignpost(index) {
    const last = SIGNPOST_SIZE * SIGNPOST_SIZE - 1;

    if (signpostNext[index] >= 0 && signpostSelected === null) {
        const next = signpostNext[index];
        signpostNext[index] = -1;
        signpostPrev[next] = -1;
        renderSignpost();
        checkSignpostWin();
        return;
    }

    if (signpostSelected === null) {
        if (index === last) return;
        signpostSelected = index;
        renderSignpost();
        return;
    }

    if (signpostSelected === index) {
        signpostSelected = null;
        renderSignpost();
        return;
    }

    const source = signpostSelected;
    signpostSelected = null;

    if (
        signpostNext[source] >= 0 ||
        signpostPrev[index] >= 0 ||
        !signpostCanPoint(source, index) ||
        signpostWouldCycle(source, index)
    ) {
        const status = document.getElementById('arrow-status');
        status.innerText = 'That link is not legal for this arrow or would create a premature cycle.';
        status.style.color = 'var(--accent-warning)';
        renderSignpost();
        return;
    }

    signpostNext[source] = index;
    signpostPrev[index] = source;
    renderSignpost();
    checkSignpostWin();
}

function signpostWouldCycle(source, target) {
    let current = target;
    const seen = new Set();
    while (current >= 0 && !seen.has(current)) {
        if (current === source) return true;
        seen.add(current);
        current = signpostNext[current];
    }
    return false;
}

function signpostNumbers() {
    const numbers = new Array(SIGNPOST_SIZE * SIGNPOST_SIZE).fill(0);
    let current = 0;
    let number = 1;
    const seen = new Set();

    while (current >= 0 && !seen.has(current)) {
        seen.add(current);
        numbers[current] = number++;
        current = signpostNext[current];
    }
    return numbers;
}

function renderSignpost() {
    const numbers = signpostNumbers();
    const final = SIGNPOST_SIZE * SIGNPOST_SIZE - 1;

    for (let r = 0; r < SIGNPOST_SIZE; r++) {
        for (let c = 0; c < SIGNPOST_SIZE; c++) {
            const idx = r * SIGNPOST_SIZE + c;
            const cell = document.getElementById(`signpost-${r}-${c}`);
            const number = idx === 0 ? 1 : idx === final ? 36 : numbers[idx];
            const arrow = signpostArrows[idx]?.symbol || '◎';
            cell.innerText = number ? `${number} ${arrow}` : arrow;
            cell.style.fontSize = number ? '11px' : '18px';
            cell.style.background = idx === signpostSelected
                ? 'rgba(67,232,166,.23)'
                : signpostPrev[idx] >= 0 || signpostNext[idx] >= 0
                    ? 'rgba(130,153,255,.16)'
                    : '';
            cell.setAttribute('aria-label', `${number ? `Number ${number}, ` : ''}arrow ${arrow}`);
        }
    }
}

function checkSignpostWin() {
    const status = document.getElementById('arrow-status');
    const numbers = signpostNumbers();
    const complete = numbers.every(Boolean) &&
        numbers[SIGNPOST_SIZE * SIGNPOST_SIZE - 1] === SIGNPOST_SIZE * SIGNPOST_SIZE;

    if (complete) {
        status.innerText = 'All 36 cells form one arrow-respecting chain. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        const linked = signpostNext.filter(next => next >= 0).length;
        status.innerText = `${linked}/${SIGNPOST_SIZE * SIGNPOST_SIZE - 1} links completed.`;
        status.style.color = '';
    }
}
