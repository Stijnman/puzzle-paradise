// NetSlide Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const NETSLIDE_SIZE = 4;
const NS_N = 1, NS_E = 2, NS_S = 4, NS_W = 8;
const NS_DIRS = [
    [-1, 0, NS_N, NS_S],
    [0, 1, NS_E, NS_W],
    [1, 0, NS_S, NS_N],
    [0, -1, NS_W, NS_E]
];
let netslideTiles = [];

function initNetSlide() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${NETSLIDE_SIZE + 2}, 1fr)`;
    board.innerHTML = '';

    netslideTiles = generateNetSlideTree();
    for (let i = 0; i < 10; i++) {
        if (Math.random() < 0.5) {
            shiftNetSlideRow(Math.floor(Math.random() * NETSLIDE_SIZE), Math.random() < 0.5 ? -1 : 1, false);
        } else {
            shiftNetSlideColumn(Math.floor(Math.random() * NETSLIDE_SIZE), Math.random() < 0.5 ? -1 : 1, false);
        }
    }
    if (isNetSlideSolved()) shiftNetSlideRow(0, 1, false);

    addNetSlideCorner(board);
    for (let c = 0; c < NETSLIDE_SIZE; c++) addNetSlideArrow(board, '↑', () => shiftNetSlideColumn(c, -1));
    addNetSlideCorner(board);

    for (let r = 0; r < NETSLIDE_SIZE; r++) {
        addNetSlideArrow(board, '←', () => shiftNetSlideRow(r, -1));
        for (let c = 0; c < NETSLIDE_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell fixed';
            cell.id = `netslide-${r}-${c}`;
            board.appendChild(cell);
        }
        addNetSlideArrow(board, '→', () => shiftNetSlideRow(r, 1));
    }

    addNetSlideCorner(board);
    for (let c = 0; c < NETSLIDE_SIZE; c++) addNetSlideArrow(board, '↓', () => shiftNetSlideColumn(c, 1));
    addNetSlideCorner(board);

    renderNetSlide();
    document.getElementById('arrow-status').innerText =
        'Use the edge arrows to cyclically slide whole rows or columns until all tiles form one network.';
}

function addNetSlideCorner(board) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell fixed';
    board.appendChild(cell);
}

function addNetSlideArrow(board, symbol, handler) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.innerText = symbol;
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');
    cell.onclick = handler;
    cell.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handler();
        }
    };
    board.appendChild(cell);
}

function generateNetSlideTree() {
    const masks = new Array(NETSLIDE_SIZE * NETSLIDE_SIZE).fill(0);
    const visited = new Set([0]);
    const frontier = [];

    function expand(index) {
        const row = Math.floor(index / NETSLIDE_SIZE);
        const col = index % NETSLIDE_SIZE;
        NS_DIRS.forEach(([dr, dc, bit, opposite]) => {
            const nr = row + dr, nc = col + dc;
            if (nr < 0 || nr >= NETSLIDE_SIZE || nc < 0 || nc >= NETSLIDE_SIZE) return;
            const next = nr * NETSLIDE_SIZE + nc;
            if (!visited.has(next)) frontier.push({ from: index, to: next, bit, opposite });
        });
    }

    expand(0);
    while (visited.size < masks.length) {
        const edge = frontier.splice(Math.floor(Math.random() * frontier.length), 1)[0];
        if (visited.has(edge.to)) continue;
        masks[edge.from] |= edge.bit;
        masks[edge.to] |= edge.opposite;
        visited.add(edge.to);
        expand(edge.to);
    }
    return masks;
}

function shiftNetSlideRow(row, direction, shouldRender = true) {
    const start = row * NETSLIDE_SIZE;
    const values = netslideTiles.slice(start, start + NETSLIDE_SIZE);
    if (direction < 0) values.push(values.shift());
    else values.unshift(values.pop());
    values.forEach((value, col) => { netslideTiles[start + col] = value; });
    if (shouldRender) {
        renderNetSlide();
        checkNetSlideWin();
    }
}

function shiftNetSlideColumn(col, direction, shouldRender = true) {
    const values = Array.from({ length: NETSLIDE_SIZE }, (_, row) =>
        netslideTiles[row * NETSLIDE_SIZE + col]
    );
    if (direction < 0) values.push(values.shift());
    else values.unshift(values.pop());
    values.forEach((value, row) => { netslideTiles[row * NETSLIDE_SIZE + col] = value; });
    if (shouldRender) {
        renderNetSlide();
        checkNetSlideWin();
    }
}

function netSlideChar(mask) {
    return ({
        1:'╵',2:'╶',3:'└',4:'╷',5:'│',6:'┌',7:'├',
        8:'╴',9:'┘',10:'─',11:'┴',12:'┐',13:'┤',14:'┬',15:'┼'
    })[mask] || '·';
}

function renderNetSlide() {
    for (let r = 0; r < NETSLIDE_SIZE; r++) {
        for (let c = 0; c < NETSLIDE_SIZE; c++) {
            const cell = document.getElementById(`netslide-${r}-${c}`);
            if (cell) cell.innerText = netSlideChar(netslideTiles[r * NETSLIDE_SIZE + c]);
        }
    }
}

function netSlideNeighbours(index) {
    const row = Math.floor(index / NETSLIDE_SIZE);
    const col = index % NETSLIDE_SIZE;
    const mask = netslideTiles[index];
    const result = [];

    NS_DIRS.forEach(([dr, dc, bit, opposite]) => {
        if (!(mask & bit)) return;
        const nr = row + dr, nc = col + dc;
        if (nr < 0 || nr >= NETSLIDE_SIZE || nc < 0 || nc >= NETSLIDE_SIZE) return;
        const next = nr * NETSLIDE_SIZE + nc;
        if (netslideTiles[next] & opposite) result.push(next);
    });
    return result;
}

function isNetSlideSolved() {
    if (!netslideTiles.length) return false;
    const reached = new Set([0]);
    const queue = [0];
    while (queue.length) {
        const current = queue.shift();
        netSlideNeighbours(current).forEach(next => {
            if (!reached.has(next)) {
                reached.add(next);
                queue.push(next);
            }
        });
    }
    return reached.size === netslideTiles.length;
}

function checkNetSlideWin() {
    const status = document.getElementById('arrow-status');
    if (isNetSlideSolved()) {
        status.innerText = 'Every tile is connected in one network. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'Keep sliding rows and columns until every tile is connected.';
        status.style.color = '';
    }
}
