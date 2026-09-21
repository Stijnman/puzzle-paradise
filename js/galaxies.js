// Galaxies / Asteroids Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const GALAXY_SIZE = 6;
const GALAXY_CENTRES = [
    { id: 1, row: 1, col: 1 },
    { id: 2, row: 1, col: 4 },
    { id: 3, row: 4, col: 1 },
    { id: 4, row: 4, col: 4 }
];
let galaxyRegions = [];

function initGalaxies() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${GALAXY_SIZE},1fr)`;
    board.innerHTML = '';
    galaxyRegions = new Array(GALAXY_SIZE * GALAXY_SIZE).fill(0);

    for (const centre of GALAXY_CENTRES) {
        galaxyRegions[centre.row * GALAXY_SIZE + centre.col] = centre.id;
    }

    for (let r = 0; r < GALAXY_SIZE; r++) {
        for (let c = 0; c < GALAXY_SIZE; c++) {
            const idx = r * GALAXY_SIZE + c;
            const centre = GALAXY_CENTRES.find(item => item.row === r && item.col === c);
            const cell = document.createElement('div');
            cell.className = 'grid-cell' + (centre ? ' fixed' : ' empty');
            cell.id = `galaxies-${r}-${c}`;
            cell.dataset.row = r;
            cell.dataset.col = c;

            if (centre) {
                cell.innerText = '✦';
                cell.setAttribute('aria-label', `Galaxy centre ${centre.id}`);
            } else {
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.onclick = () => cycleGalaxy(idx);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        cycleGalaxy(idx);
                    }
                };
            }
            board.appendChild(cell);
        }
    }

    renderGalaxies();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Assign every cell to a centre so each connected galaxy is rotationally symmetric.';
    status.style.color = '';
}

function cycleGalaxy(index) {
    galaxyRegions[index] = (galaxyRegions[index] + 1) % (GALAXY_CENTRES.length + 1);
    renderGalaxies();
    checkGalaxiesWin();
}

function renderGalaxies() {
    const colors = [
        'transparent',
        'rgba(99,102,241,.24)',
        'rgba(16,185,129,.24)',
        'rgba(245,158,11,.24)',
        'rgba(236,72,153,.24)'
    ];

    for (let r = 0; r < GALAXY_SIZE; r++) {
        for (let c = 0; c < GALAXY_SIZE; c++) {
            const idx = r * GALAXY_SIZE + c;
            const centre = GALAXY_CENTRES.find(item => item.row === r && item.col === c);
            const cell = document.getElementById(`galaxies-${r}-${c}`);
            const region = galaxyRegions[idx];
            cell.style.background = colors[region] || 'transparent';
            if (!centre) cell.innerText = region ? String(region) : '';
            cell.classList.toggle('empty', !region && !centre);
            cell.setAttribute(
                'aria-label',
                centre ? `Galaxy centre ${centre.id}` :
                    `Row ${r + 1}, column ${c + 1}, ${region ? `galaxy ${region}` : 'unassigned'}`
            );
        }
    }
}

function galaxyCells(id) {
    const result = [];
    galaxyRegions.forEach((region, index) => {
        if (region === id) result.push(index);
    });
    return result;
}

function galaxyConnected(id) {
    const cells = galaxyCells(id);
    if (!cells.length) return false;
    const allowed = new Set(cells);
    const reached = new Set([cells[0]]);
    const queue = [cells[0]];

    while (queue.length) {
        const idx = queue.shift();
        const row = Math.floor(idx / GALAXY_SIZE);
        const col = idx % GALAXY_SIZE;
        for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const r = row + dr, c = col + dc;
            if (r < 0 || r >= GALAXY_SIZE || c < 0 || c >= GALAXY_SIZE) continue;
            const next = r * GALAXY_SIZE + c;
            if (allowed.has(next) && !reached.has(next)) {
                reached.add(next);
                queue.push(next);
            }
        }
    }
    return reached.size === cells.length;
}

function galaxySymmetric(id) {
    const centre = GALAXY_CENTRES.find(item => item.id === id);
    const cells = new Set(galaxyCells(id));
    return [...cells].every(index => {
        const row = Math.floor(index / GALAXY_SIZE);
        const col = index % GALAXY_SIZE;
        const mirrorRow = centre.row * 2 - row;
        const mirrorCol = centre.col * 2 - col;
        if (mirrorRow < 0 || mirrorRow >= GALAXY_SIZE || mirrorCol < 0 || mirrorCol >= GALAXY_SIZE) return false;
        return cells.has(mirrorRow * GALAXY_SIZE + mirrorCol);
    });
}

function checkGalaxiesWin() {
    const status = document.getElementById('arrow-status');
    if (galaxyRegions.some(region => region === 0)) {
        status.innerText = 'Every cell must belong to a galaxy.';
        status.style.color = '';
        return;
    }

    const valid = GALAXY_CENTRES.every(centre =>
        galaxyRegions[centre.row * GALAXY_SIZE + centre.col] === centre.id &&
        galaxyConnected(centre.id) &&
        galaxySymmetric(centre.id)
    );

    if (valid) {
        status.innerText = 'All galaxies are connected and rotationally symmetric. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'Each galaxy must stay connected and mirror perfectly around its centre.';
        status.style.color = 'var(--accent-warning)';
    }
}
