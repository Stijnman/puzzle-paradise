// Galaxies / Asteroids Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 8;
let regions = [];

function initGalaxies() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    regions = [];

    // Create galaxy regions - each region is rotationally symmetric around its center
    // Each region contains exactly one "star" (center cell)

    // Initialize all cells as unassigned
    regions = new Array(BOARD_SIZE * BOARD_SIZE).fill(null);

    // Place stars (one per region) - simplified: place on main diagonal
    for (let i = 0; i < BOARD_SIZE; i++) {
        regions[i * BOARD_SIZE + i] = 'star';
    }

    // Fill remaining cells with region numbers
    let regionId = 1;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (!regions[idx]) {
                regions[idx] = regionId;
                regionId = (regionId % 9) + 1; // Cycle 1-9
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `galaxies-${r}-${c}`;

            if (regions[idx] === 'star') {
                cell.innerText = '★';
                cell.style.fontSize = '20px';
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
            } else if (regions[idx]) {
                cell.innerText = regions[idx] % 10 || 10;
                cell.style.color = getRegionColor(regions[idx]);
                cell.style.fontWeight = 'bold';
            } else {
                cell.innerText = '';
            }

            cell.onclick = () => {
                // Toggle region assignment (simplified interaction)
                if (regions[idx] === 'star') {
                    regions[idx] = 0;
                    cell.innerText = '';
                } else if (regions[idx]) {
                    regions[idx] = 0;
                    cell.innerText = '';
                } else {
                    regions[idx] = regionId++;
                    if (regionId > 9) regionId = 1;
                    cell.innerText = regions[idx] % 10 || 10;
                    cell.style.color = getRegionColor(regions[idx]);
                }
                checkGalaxiesWin();
            };

            board.appendChild(cell);
        }
    }

    checkGalaxiesWin();
}

function getRegionColor(regionId) {
    const colors = ['#2563eb', '#1e40af', '#3b82f6', '#6366f1', '#8b5cf6'];
    return colors[regionId - 1] || '#6366f1';
}

function checkGalaxiesWin() {
    const status = document.getElementById('arrow-status');
    let stars = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (regions[r * BOARD_SIZE + c] === 'star') stars++;
        }
    }
    if (stars === BOARD_SIZE) {
        status.innerText = 'All galaxies formed! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
