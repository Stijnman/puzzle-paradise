// Bridges / Hashiwokakero Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const BRIDGES_SIZE = 7;
const BRIDGE_ISLANDS = [
    { id: 'A', row: 0, col: 0, clue: 1 },
    { id: 'B', row: 0, col: 3, clue: 3 },
    { id: 'C', row: 0, col: 6, clue: 1 },
    { id: 'D', row: 3, col: 0, clue: 1 },
    { id: 'E', row: 3, col: 3, clue: 4 },
    { id: 'F', row: 3, col: 6, clue: 1 },
    { id: 'G', row: 6, col: 0, clue: 1 },
    { id: 'H', row: 6, col: 3, clue: 3 },
    { id: 'I', row: 6, col: 6, clue: 1 }
];

const BRIDGE_ALLOWED = [
    ['A','B'], ['B','C'], ['A','D'], ['B','E'], ['C','F'],
    ['D','E'], ['E','F'], ['D','G'], ['E','H'], ['F','I'],
    ['G','H'], ['H','I']
];

let bridgeCounts = new Map();
let bridgeSelected = null;

function initBridges() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BRIDGES_SIZE}, 1fr)`;
    board.innerHTML = '';
    bridgeCounts = new Map(BRIDGE_ALLOWED.map(pair => [bridgeKey(...pair), 0]));
    bridgeSelected = null;

    for (let r = 0; r < BRIDGES_SIZE; r++) {
        for (let c = 0; c < BRIDGES_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = `bridges-${r}-${c}`;
            cell.style.fontSize = '18px';
            board.appendChild(cell);
        }
    }

    for (const island of BRIDGE_ISLANDS) {
        const cell = document.getElementById(`bridges-${island.row}-${island.col}`);
        cell.className = 'grid-cell fixed';
        cell.innerText = island.clue;
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', `Island ${island.id}, needs ${island.clue} bridges`);
        cell.onclick = () => selectBridgeIsland(island.id);
        cell.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectBridgeIsland(island.id);
            }
        };
    }

    renderBridges();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Select two visible islands to cycle 0, 1, or 2 bridges. Match every island number and connect all islands.';
    status.style.color = '';
}

function bridgeKey(a, b) {
    return [a, b].sort().join('-');
}

function bridgeIsland(id) {
    return BRIDGE_ISLANDS.find(island => island.id === id);
}

function bridgeNeighbours(id) {
    return BRIDGE_ALLOWED
        .filter(pair => pair.includes(id))
        .map(pair => pair[0] === id ? pair[1] : pair[0]);
}

function selectBridgeIsland(id) {
    if (bridgeSelected === null) {
        bridgeSelected = id;
        renderBridges();
        return;
    }

    if (bridgeSelected === id) {
        bridgeSelected = null;
        renderBridges();
        return;
    }

    const key = bridgeKey(bridgeSelected, id);
    if (bridgeCounts.has(key)) {
        bridgeCounts.set(key, (bridgeCounts.get(key) + 1) % 3);
        bridgeSelected = null;
        renderBridges();
        checkBridgesWin();
        return;
    }

    const status = document.getElementById('arrow-status');
    status.innerText = 'Those islands are not direct neighbours in the same row or column.';
    status.style.color = 'var(--accent-warning)';
    bridgeSelected = id;
    renderBridges();
}

function renderBridges() {
    for (let r = 0; r < BRIDGES_SIZE; r++) {
        for (let c = 0; c < BRIDGES_SIZE; c++) {
            const island = BRIDGE_ISLANDS.find(item => item.row === r && item.col === c);
            const cell = document.getElementById(`bridges-${r}-${c}`);
            if (!island) {
                cell.innerText = '';
                cell.style.background = 'rgba(8,10,24,.35)';
                cell.style.color = 'var(--primary)';
                cell.className = 'grid-cell empty';
            } else {
                cell.innerText = island.clue;
                cell.style.background = island.id === bridgeSelected
                    ? 'rgba(34,197,94,.25)'
                    : 'rgba(99,102,241,.16)';
            }
        }
    }

    for (const [a, b] of BRIDGE_ALLOWED) {
        const count = bridgeCounts.get(bridgeKey(a, b));
        if (!count) continue;
        const first = bridgeIsland(a);
        const second = bridgeIsland(b);
        const horizontal = first.row === second.row;
        const symbol = horizontal
            ? (count === 1 ? '─' : '═')
            : (count === 1 ? '│' : '║');

        if (horizontal) {
            const from = Math.min(first.col, second.col) + 1;
            const to = Math.max(first.col, second.col);
            for (let c = from; c < to; c++) {
                const cell = document.getElementById(`bridges-${first.row}-${c}`);
                cell.innerText = symbol;
                cell.classList.remove('empty');
            }
        } else {
            const from = Math.min(first.row, second.row) + 1;
            const to = Math.max(first.row, second.row);
            for (let r = from; r < to; r++) {
                const cell = document.getElementById(`bridges-${r}-${first.col}`);
                cell.innerText = symbol;
                cell.classList.remove('empty');
            }
        }
    }
}

function bridgeDegree(id) {
    return bridgeNeighbours(id).reduce(
        (sum, neighbour) => sum + bridgeCounts.get(bridgeKey(id, neighbour)),
        0
    );
}

function bridgesConnected() {
    const reached = new Set([BRIDGE_ISLANDS[0].id]);
    const queue = [BRIDGE_ISLANDS[0].id];

    while (queue.length) {
        const current = queue.shift();
        for (const neighbour of bridgeNeighbours(current)) {
            if (bridgeCounts.get(bridgeKey(current, neighbour)) === 0) continue;
            if (reached.has(neighbour)) continue;
            reached.add(neighbour);
            queue.push(neighbour);
        }
    }

    return reached.size === BRIDGE_ISLANDS.length;
}

function checkBridgesWin() {
    const degreesValid = BRIDGE_ISLANDS.every(island =>
        bridgeDegree(island.id) === island.clue
    );
    const connected = bridgesConnected();
    const status = document.getElementById('arrow-status');

    if (degreesValid && connected) {
        status.innerText = 'Every island number matches and the bridge network is connected. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (degreesValid) {
        status.innerText = 'The island numbers match, but the network is split into separate groups.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = 'Match each island number using at most two bridges per direct neighbour.';
        status.style.color = '';
    }
}
