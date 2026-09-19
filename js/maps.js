// Map Colouring Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const MAP_REGION_GRID = [
    [0, 0, 1, 1, 2, 2],
    [0, 3, 3, 1, 2, 4],
    [5, 3, 6, 6, 4, 4],
    [5, 5, 6, 7, 7, 4],
    [8, 5, 9, 9, 7, 10],
    [8, 8, 9, 11, 10, 10]
];
const MAP_SIZE = MAP_REGION_GRID.length;
const MAP_REGION_COUNT = 12;
const MAP_COLOURS = [
    'rgba(99,102,241,.72)',
    'rgba(16,185,129,.72)',
    'rgba(245,158,11,.72)',
    'rgba(236,72,153,.72)'
];
const MAP_FIXED_REGIONS = new Set([0, 2, 7, 11]);

let mapColours = [];
let mapSolution = [];

function initMaps() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${MAP_SIZE}, 1fr)`;
    board.innerHTML = '';

    const adjacency = buildMapAdjacency();
    mapSolution = solveMapColouring(adjacency);
    mapColours = new Array(MAP_REGION_COUNT).fill(0);
    MAP_FIXED_REGIONS.forEach(region => {
        mapColours[region] = mapSolution[region];
    });

    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            const region = MAP_REGION_GRID[r][c];
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `map-${r}-${c}`;
            cell.dataset.region = region;
            cell.style.fontSize = '11px';
            cell.style.borderTopWidth = r === 0 || MAP_REGION_GRID[r - 1][c] !== region ? '3px' : '1px';
            cell.style.borderBottomWidth = r === MAP_SIZE - 1 || MAP_REGION_GRID[r + 1][c] !== region ? '3px' : '1px';
            cell.style.borderLeftWidth = c === 0 || MAP_REGION_GRID[r][c - 1] !== region ? '3px' : '1px';
            cell.style.borderRightWidth = c === MAP_SIZE - 1 || MAP_REGION_GRID[r][c + 1] !== region ? '3px' : '1px';

            if (!MAP_FIXED_REGIONS.has(region)) {
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.onclick = () => cycleMapRegion(region);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        cycleMapRegion(region);
                    }
                };
            } else {
                cell.classList.add('fixed');
            }

            board.appendChild(cell);
        }
    }

    renderMap();
    document.getElementById('arrow-status').innerText =
        'Colour every region with one of four colours. Regions sharing an edge must differ.';
}

function buildMapAdjacency() {
    const adjacency = Array.from({ length: MAP_REGION_COUNT }, () => new Set());

    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            const here = MAP_REGION_GRID[r][c];
            [[1, 0], [0, 1]].forEach(([dr, dc]) => {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= MAP_SIZE || nc >= MAP_SIZE) return;
                const there = MAP_REGION_GRID[nr][nc];
                if (here !== there) {
                    adjacency[here].add(there);
                    adjacency[there].add(here);
                }
            });
        }
    }
    return adjacency;
}

function solveMapColouring(adjacency) {
    const result = new Array(MAP_REGION_COUNT).fill(0);

    function place(region) {
        if (region === MAP_REGION_COUNT) return true;

        for (let colour = 1; colour <= MAP_COLOURS.length; colour++) {
            if ([...adjacency[region]].every(neighbour => result[neighbour] !== colour)) {
                result[region] = colour;
                if (place(region + 1)) return true;
                result[region] = 0;
            }
        }
        return false;
    }

    if (!place(0)) throw new Error('Map definition is not four-colourable');
    return result;
}

function cycleMapRegion(region) {
    if (MAP_FIXED_REGIONS.has(region)) return;
    mapColours[region] = (mapColours[region] + 1) % (MAP_COLOURS.length + 1);
    renderMap();
    checkMapsWin();
}

function renderMap() {
    for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
            const region = MAP_REGION_GRID[r][c];
            const cell = document.getElementById(`map-${r}-${c}`);
            const colour = mapColours[region];

            cell.style.background = colour ? MAP_COLOURS[colour - 1] : 'rgba(8,10,24,.35)';
            cell.innerText = String(region + 1);
            cell.setAttribute(
                'aria-label',
                `Region ${region + 1}, ${colour ? `colour ${colour}` : 'uncoloured'}${MAP_FIXED_REGIONS.has(region) ? ', fixed' : ''}`
            );
        }
    }
}

function checkMapsWin() {
    const status = document.getElementById('arrow-status');
    const adjacency = buildMapAdjacency();
    const complete = mapColours.every(Boolean);
    const valid = complete && adjacency.every((neighbours, region) =>
        [...neighbours].every(neighbour => mapColours[region] !== mapColours[neighbour])
    );

    if (valid) {
        status.innerText = 'All adjacent regions differ. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (complete) {
        status.innerText = 'At least two neighbouring regions still share a colour.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = 'Colour every region; neighbours sharing an edge must differ.';
        status.style.color = '';
    }
}
