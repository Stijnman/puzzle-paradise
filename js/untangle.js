// Untangle Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const UNTANGLE_POINT_COUNT = 6;
const UNTANGLE_POSITIONS = [
    { x: 50, y: 8 },
    { x: 86, y: 29 },
    { x: 86, y: 71 },
    { x: 50, y: 92 },
    { x: 14, y: 71 },
    { x: 14, y: 29 }
];
const UNTANGLE_EDGES = [
    [0, 1], [1, 2], [2, 3],
    [3, 4], [4, 5], [5, 0]
];

let untangleOrder = [];
let untangleSelectedSlot = null;

function initUntangle() {
    const board = document.getElementById('arrow-board');
    board.style.display = 'block';
    board.style.position = 'relative';
    board.style.width = 'min(78vw,360px)';
    board.style.height = 'min(78vw,360px)';
    board.style.overflow = 'hidden';

    untangleOrder = Array.from({ length: UNTANGLE_POINT_COUNT }, (_, index) => index);
    do {
        shuffleUntangleOrder();
    } while (countUntangleCrossings(untangleOrder) === 0);

    untangleSelectedSlot = null;
    renderUntangle();
}

function shuffleUntangleOrder() {
    for (let i = untangleOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [untangleOrder[i], untangleOrder[j]] = [untangleOrder[j], untangleOrder[i]];
    }
}

function renderUntangle() {
    const board = document.getElementById('arrow-board');
    board.innerHTML = '';

    UNTANGLE_EDGES.forEach(([a, b]) => {
        const start = UNTANGLE_POSITIONS[untangleOrder.indexOf(a)];
        const end = UNTANGLE_POSITIONS[untangleOrder.indexOf(b)];
        board.appendChild(createUntangleLine(start, end));
    });

    untangleOrder.forEach((label, slot) => {
        const position = UNTANGLE_POSITIONS[slot];
        const point = document.createElement('div');
        point.className = 'grid-cell';
        point.id = `untangle-point-${slot}`;
        point.innerText = String(label + 1);
        point.style.position = 'absolute';
        point.style.left = `calc(${position.x}% - 22px)`;
        point.style.top = `calc(${position.y}% - 22px)`;
        point.style.zIndex = '2';
        point.style.borderColor = slot === untangleSelectedSlot ? 'var(--accent-success)' : '';
        point.setAttribute('role', 'button');
        point.setAttribute('tabindex', '0');
        point.setAttribute('aria-label', `Point ${label + 1}`);
        point.onclick = () => selectUntangleSlot(slot);
        point.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectUntangleSlot(slot);
            }
        };
        board.appendChild(point);
    });

    checkUntangleWin();
}

function createUntangleLine(start, end) {
    const line = document.createElement('div');
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    line.style.position = 'absolute';
    line.style.left = `${start.x}%`;
    line.style.top = `${start.y}%`;
    line.style.width = `${distance}%`;
    line.style.height = '3px';
    line.style.transformOrigin = '0 50%';
    line.style.transform = `rotate(${angle}deg)`;
    line.style.background = 'var(--primary)';
    line.style.opacity = '.72';
    line.style.pointerEvents = 'none';
    return line;
}

function selectUntangleSlot(slot) {
    if (untangleSelectedSlot === null) {
        untangleSelectedSlot = slot;
        renderUntangle();
        return;
    }

    if (untangleSelectedSlot === slot) {
        untangleSelectedSlot = null;
        renderUntangle();
        return;
    }

    [untangleOrder[untangleSelectedSlot], untangleOrder[slot]] =
        [untangleOrder[slot], untangleOrder[untangleSelectedSlot]];
    untangleSelectedSlot = null;
    renderUntangle();
}

function countUntangleCrossings(order) {
    const segments = UNTANGLE_EDGES.map(([a, b]) => [
        UNTANGLE_POSITIONS[order.indexOf(a)],
        UNTANGLE_POSITIONS[order.indexOf(b)]
    ]);

    let crossings = 0;
    for (let i = 0; i < segments.length; i++) {
        for (let j = i + 1; j < segments.length; j++) {
            const first = UNTANGLE_EDGES[i];
            const second = UNTANGLE_EDGES[j];
            if (first.some(vertex => second.includes(vertex))) continue;
            if (untangleSegmentsCross(...segments[i], ...segments[j])) crossings++;
        }
    }
    return crossings;
}

function untangleSegmentsCross(a, b, c, d) {
    const orientation = (p, q, r) =>
        Math.sign((q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y));

    return (
        orientation(a, b, c) !== orientation(a, b, d) &&
        orientation(c, d, a) !== orientation(c, d, b)
    );
}

function checkUntangleWin() {
    const status = document.getElementById('arrow-status');
    const crossings = countUntangleCrossings(untangleOrder);

    if (crossings === 0) {
        status.innerText = 'No lines cross. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (untangleSelectedSlot !== null) {
        status.innerText = `${crossings} crossing${crossings === 1 ? '' : 's'} remain. Select another point to swap.`;
        status.style.color = '';
    } else {
        status.innerText = `${crossings} crossing${crossings === 1 ? '' : 's'} remain. Swap two numbered points.`;
        status.style.color = '';
    }
}
