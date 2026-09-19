// Rectangles Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const RECT_SIZE = 6;
const RECT_CLUES = new Map([
    [0 * RECT_SIZE + 1, 6],
    [0 * RECT_SIZE + 4, 6],
    [2 * RECT_SIZE + 1, 6],
    [2 * RECT_SIZE + 4, 6],
    [4 * RECT_SIZE + 1, 6],
    [4 * RECT_SIZE + 4, 6]
]);
let rectRegions = [];
let rectStart = null;

function initRect() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${RECT_SIZE}, 1fr)`;
    board.innerHTML = '';
    rectRegions = [];
    rectStart = null;

    for (let r = 0; r < RECT_SIZE; r++) {
        for (let c = 0; c < RECT_SIZE; c++) {
            const idx = r * RECT_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = `rect-${r}-${c}`;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.onclick = () => selectRectCorner(r, c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectRectCorner(r, c);
                }
            };
            board.appendChild(cell);
        }
    }

    renderRectangles();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Select two opposite corners to draw a rectangle. Each rectangle must contain one clue and have that area.';
    status.style.color = '';
}

function selectRectCorner(row, col) {
    const existing = rectRegions.findIndex(region =>
        row >= region.top && row <= region.bottom && col >= region.left && col <= region.right
    );

    if (existing >= 0 && rectStart === null) {
        rectRegions.splice(existing, 1);
        renderRectangles();
        checkRectWin();
        return;
    }

    if (rectStart === null) {
        rectStart = { row, col };
        renderRectangles();
        return;
    }

    const region = {
        top: Math.min(rectStart.row, row),
        bottom: Math.max(rectStart.row, row),
        left: Math.min(rectStart.col, col),
        right: Math.max(rectStart.col, col)
    };
    rectStart = null;

    if (!rectRegionOverlaps(region)) {
        rectRegions.push(region);
    } else {
        const status = document.getElementById('arrow-status');
        status.innerText = 'Rectangles cannot overlap.';
        status.style.color = 'var(--accent-warning)';
    }

    renderRectangles();
    checkRectWin();
}

function rectRegionOverlaps(candidate) {
    return rectRegions.some(region =>
        !(candidate.right < region.left ||
          candidate.left > region.right ||
          candidate.bottom < region.top ||
          candidate.top > region.bottom)
    );
}

function rectRegionCells(region) {
    const cells = [];
    for (let r = region.top; r <= region.bottom; r++) {
        for (let c = region.left; c <= region.right; c++) {
            cells.push(r * RECT_SIZE + c);
        }
    }
    return cells;
}

function rectRegionValid(region) {
    const cells = rectRegionCells(region);
    const clues = cells.filter(index => RECT_CLUES.has(index));
    return clues.length === 1 && cells.length === RECT_CLUES.get(clues[0]);
}

function renderRectangles() {
    for (let r = 0; r < RECT_SIZE; r++) {
        for (let c = 0; c < RECT_SIZE; c++) {
            const idx = r * RECT_SIZE + c;
            const cell = document.getElementById(`rect-${r}-${c}`);
            const regionIndex = rectRegions.findIndex(region =>
                r >= region.top && r <= region.bottom && c >= region.left && c <= region.right
            );

            cell.innerText = RECT_CLUES.has(idx) ? String(RECT_CLUES.get(idx)) : '';
            cell.style.background = regionIndex >= 0
                ? `hsla(${(regionIndex * 53) % 360},65%,55%,.25)`
                : 'rgba(8,10,24,.35)';
            cell.style.outline = rectStart && rectStart.row === r && rectStart.col === c
                ? '3px solid var(--accent-success)'
                : '';
            cell.classList.toggle('empty', regionIndex < 0);
            cell.setAttribute(
                'aria-label',
                `${RECT_CLUES.has(idx) ? `Clue ${RECT_CLUES.get(idx)}, ` : ''}row ${r + 1}, column ${c + 1}`
            );
        }
    }
}

function checkRectWin() {
    const covered = new Set(rectRegions.flatMap(rectRegionCells));
    const complete = covered.size === RECT_SIZE * RECT_SIZE;
    const valid = rectRegions.every(rectRegionValid);
    const status = document.getElementById('arrow-status');

    if (complete && valid) {
        status.innerText = 'The grid is partitioned into valid clue-sized rectangles. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (rectRegions.some(region => !rectRegionValid(region))) {
        status.innerText = 'A rectangle must contain exactly one clue and its area must equal that clue.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = `${covered.size}/${RECT_SIZE * RECT_SIZE} cells covered by valid rectangles.`;
        status.style.color = '';
    }
}
