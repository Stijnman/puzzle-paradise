// Pipe Routing / Net Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const NET_SIZE = 4;
const NET_N = 1;
const NET_E = 2;
const NET_S = 4;
const NET_W = 8;
const NET_DIRS = [
    [-1, 0, NET_N, NET_S],
    [0, 1, NET_E, NET_W],
    [1, 0, NET_S, NET_N],
    [0, -1, NET_W, NET_E]
];

let netState = [];

function initNetGame() {
    const board = document.getElementById('net-board');
    const status = document.getElementById('net-status');

    board.style.gridTemplateColumns = `repeat(${NET_SIZE}, 1fr)`;
    board.innerHTML = '';
    status.innerText = 'Rotate the pipes until all 16 tiles form one connected network.';
    status.style.color = '';

    const solved = generateNetTree();
    netState = solved.map(mask => rotateNetMask(mask, Math.floor(Math.random() * 4)));

    if (isNetSolved()) {
        netState[0] = rotateNetMask(netState[0], 1);
    }

    netState.forEach((_, index) => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.id = `net-${index}`;
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.onclick = () => rotateNetCell(index);
        cell.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                rotateNetCell(index);
            }
        };
        board.appendChild(cell);
    });

    renderNetBoard();
}

function generateNetTree() {
    const masks = new Array(NET_SIZE * NET_SIZE).fill(0);
    const visited = new Set([0]);
    const frontier = [];

    function addFrontier(index) {
        const row = Math.floor(index / NET_SIZE);
        const col = index % NET_SIZE;

        NET_DIRS.forEach(([dr, dc, bit, opposite]) => {
            const nr = row + dr;
            const nc = col + dc;
            if (nr < 0 || nr >= NET_SIZE || nc < 0 || nc >= NET_SIZE) return;

            const next = nr * NET_SIZE + nc;
            if (!visited.has(next)) frontier.push({ from: index, to: next, bit, opposite });
        });
    }

    addFrontier(0);

    while (visited.size < masks.length) {
        const pick = Math.floor(Math.random() * frontier.length);
        const edge = frontier.splice(pick, 1)[0];
        if (visited.has(edge.to)) continue;

        masks[edge.from] |= edge.bit;
        masks[edge.to] |= edge.opposite;
        visited.add(edge.to);
        addFrontier(edge.to);
    }

    return masks;
}

function rotateNetMask(mask, turns = 1) {
    let result = mask;
    for (let i = 0; i < turns; i++) {
        result =
            ((result & NET_N) ? NET_E : 0) |
            ((result & NET_E) ? NET_S : 0) |
            ((result & NET_S) ? NET_W : 0) |
            ((result & NET_W) ? NET_N : 0);
    }
    return result;
}

function rotateNetCell(index) {
    netState[index] = rotateNetMask(netState[index], 1);
    renderNetBoard();
    checkNetGameWin();
}

function renderNetBoard() {
    netState.forEach((mask, index) => {
        const cell = document.getElementById(`net-${index}`);
        if (!cell) return;

        cell.innerText = netPipeCharacter(mask);
        cell.setAttribute(
            'aria-label',
            `Pipe tile row ${Math.floor(index / NET_SIZE) + 1}, column ${index % NET_SIZE + 1}`
        );
    });
}

function netPipeCharacter(mask) {
    const chars = {
        1: '╵', 2: '╶', 3: '└', 4: '╷',
        5: '│', 6: '┌', 7: '├', 8: '╴',
        9: '┘', 10: '─', 11: '┴', 12: '┐',
        13: '┤', 14: '┬', 15: '┼'
    };
    return chars[mask] || '·';
}

function connectedNetNeighbours(index) {
    const row = Math.floor(index / NET_SIZE);
    const col = index % NET_SIZE;
    const mask = netState[index];
    const neighbours = [];

    NET_DIRS.forEach(([dr, dc, bit, opposite]) => {
        if (!(mask & bit)) return;

        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= NET_SIZE || nc < 0 || nc >= NET_SIZE) return;

        const next = nr * NET_SIZE + nc;
        if (netState[next] & opposite) neighbours.push(next);
    });

    return neighbours;
}

function isNetSolved() {
    if (!netState.length) return false;

    const reached = new Set([0]);
    const queue = [0];

    while (queue.length) {
        const current = queue.shift();
        connectedNetNeighbours(current).forEach(next => {
            if (!reached.has(next)) {
                reached.add(next);
                queue.push(next);
            }
        });
    }

    return reached.size === netState.length;
}

function checkNetGameWin() {
    const status = document.getElementById('net-status');
    if (isNetSolved()) {
        status.innerText = 'Network connected. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'Keep rotating: every tile must belong to one connected network.';
        status.style.color = '';
    }
}
