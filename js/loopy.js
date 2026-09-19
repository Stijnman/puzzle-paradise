// Loopy / Slitherlink Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const LOOPY_SIZE = 4;
let loopyEdges = new Set();
let loopyClues = [];

function initLoopy() {
    const board = document.getElementById('arrow-board');
    const side = LOOPY_SIZE * 2 + 1;
    board.style.gridTemplateColumns = `repeat(${side}, minmax(18px,1fr))`;
    board.innerHTML = '';
    loopyEdges = new Set();
    loopyClues = buildLoopyClues();

    for (let vr = 0; vr < side; vr++) {
        for (let vc = 0; vc < side; vc++) {
            const cell = document.createElement('div');
            cell.style.minWidth = '18px';
            cell.style.minHeight = '18px';
            cell.style.display = 'grid';
            cell.style.placeItems = 'center';

            if (vr % 2 === 0 && vc % 2 === 0) {
                cell.innerText = '•';
                cell.setAttribute('aria-hidden', 'true');
            } else if (vr % 2 === 1 && vc % 2 === 1) {
                const row = (vr - 1) / 2;
                const col = (vc - 1) / 2;
                const clue = loopyClues[row * LOOPY_SIZE + col];
                cell.className = 'grid-cell fixed';
                cell.innerText = clue;
                cell.style.fontSize = '11px';
                cell.setAttribute('aria-label', `Loop clue ${clue}`);
            } else {
                const edge = loopyVisualEdge(vr, vc);
                cell.className = 'grid-cell empty';
                cell.id = `loopy-edge-${vr}-${vc}`;
                cell.dataset.edge = edge;
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.setAttribute('aria-label', 'Toggle loop edge');
                cell.onclick = () => toggleLoopyEdge(edge);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleLoopyEdge(edge);
                    }
                };
            }

            board.appendChild(cell);
        }
    }

    renderLoopy();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Draw one closed loop. Each number tells how many of its four surrounding edges belong to the loop.';
    status.style.color = '';
}

function loopyVertex(row, col) {
    return row * (LOOPY_SIZE + 1) + col;
}

function loopyEdgeKey(a, b) {
    return [a, b].sort((x, y) => x - y).join('-');
}

function loopyVisualEdge(vr, vc) {
    if (vr % 2 === 0) {
        const row = vr / 2;
        const col = (vc - 1) / 2;
        return loopyEdgeKey(loopyVertex(row, col), loopyVertex(row, col + 1));
    }

    const row = (vr - 1) / 2;
    const col = vc / 2;
    return loopyEdgeKey(loopyVertex(row, col), loopyVertex(row + 1, col));
}

function buildLoopyTarget() {
    const target = new Set();

    for (let c = 0; c < LOOPY_SIZE; c++) {
        target.add(loopyEdgeKey(loopyVertex(0, c), loopyVertex(0, c + 1)));
        target.add(loopyEdgeKey(loopyVertex(LOOPY_SIZE, c), loopyVertex(LOOPY_SIZE, c + 1)));
    }
    for (let r = 0; r < LOOPY_SIZE; r++) {
        target.add(loopyEdgeKey(loopyVertex(r, 0), loopyVertex(r + 1, 0)));
        target.add(loopyEdgeKey(loopyVertex(r, LOOPY_SIZE), loopyVertex(r + 1, LOOPY_SIZE)));
    }

    return target;
}

function loopyCellEdges(row, col) {
    return [
        loopyEdgeKey(loopyVertex(row, col), loopyVertex(row, col + 1)),
        loopyEdgeKey(loopyVertex(row + 1, col), loopyVertex(row + 1, col + 1)),
        loopyEdgeKey(loopyVertex(row, col), loopyVertex(row + 1, col)),
        loopyEdgeKey(loopyVertex(row, col + 1), loopyVertex(row + 1, col + 1))
    ];
}

function buildLoopyClues() {
    const target = buildLoopyTarget();
    return Array.from({ length: LOOPY_SIZE * LOOPY_SIZE }, (_, index) => {
        const row = Math.floor(index / LOOPY_SIZE);
        const col = index % LOOPY_SIZE;
        return loopyCellEdges(row, col).filter(edge => target.has(edge)).length;
    });
}

function toggleLoopyEdge(edge) {
    if (loopyEdges.has(edge)) loopyEdges.delete(edge);
    else loopyEdges.add(edge);
    renderLoopy();
    checkLoopyWin();
}

function renderLoopy() {
    const side = LOOPY_SIZE * 2 + 1;
    for (let vr = 0; vr < side; vr++) {
        for (let vc = 0; vc < side; vc++) {
            if (vr % 2 === vc % 2) continue;
            const cell = document.getElementById(`loopy-edge-${vr}-${vc}`);
            if (!cell) continue;
            const edge = cell.dataset.edge;
            const active = loopyEdges.has(edge);
            cell.innerText = active ? (vr % 2 === 0 ? '━' : '┃') : '';
            cell.classList.toggle('empty', !active);
            cell.style.color = 'var(--primary)';
        }
    }
}

function loopySingleLoop() {
    if (!loopyEdges.size) return false;

    const adjacency = new Map();
    for (const edge of loopyEdges) {
        const [a, b] = edge.split('-').map(Number);
        if (!adjacency.has(a)) adjacency.set(a, []);
        if (!adjacency.has(b)) adjacency.set(b, []);
        adjacency.get(a).push(b);
        adjacency.get(b).push(a);
    }

    if ([...adjacency.values()].some(neighbours => neighbours.length !== 2)) return false;

    const start = adjacency.keys().next().value;
    const reached = new Set([start]);
    const queue = [start];

    while (queue.length) {
        const current = queue.shift();
        for (const next of adjacency.get(current)) {
            if (reached.has(next)) continue;
            reached.add(next);
            queue.push(next);
        }
    }

    return reached.size === adjacency.size;
}

function checkLoopyWin() {
    const cluesValid = loopyClues.every((clue, index) => {
        const row = Math.floor(index / LOOPY_SIZE);
        const col = index % LOOPY_SIZE;
        return loopyCellEdges(row, col).filter(edge => loopyEdges.has(edge)).length === clue;
    });
    const singleLoop = loopySingleLoop();
    const status = document.getElementById('arrow-status');

    if (cluesValid && singleLoop) {
        status.innerText = 'Every clue matches and the edges form one closed loop. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (loopyEdges.size && !singleLoop) {
        status.innerText = 'The selected edges do not yet form one closed, non-branching loop.';
        status.style.color = '';
    } else {
        status.innerText = 'Draw a single loop while matching every numbered clue.';
        status.style.color = '';
    }
}
