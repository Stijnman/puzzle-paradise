// Maps Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let cities = [];

function initMaps() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    cities = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Place cities with numbers indicating distance to nearest city
    // Each number tells you how far the nearest city is

    // Create random city locations
    const numCities = 5;
    for (let i = 0; i < numCities; i++) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        cities[idx] = -1; // -1 = city
    }

    // Calculate distances from each cell to nearest city
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (cities[idx] !== -1) {
                let minDist = BOARD_SIZE * BOARD_SIZE;
                for (let ci = 0; ci < BOARD_SIZE * BOARD_SIZE; ci++) {
                    if (cities[ci] === -1) {
                        const cr = Math.floor(ci / BOARD_SIZE);
                        const cc = ci % BOARD_SIZE;
                        const dist = Math.abs(r - cr) + Math.abs(c - cc); // Manhattan distance
                        if (dist < minDist) minDist = dist;
                    }
                }
                cities[idx] = minDist;
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `maps-${r}-${c}`;

            if (cities[idx] === -1) {
                cell.innerText = '★'; // Star for city
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else if (cities[idx] > 0) {
                cell.innerText = cities[idx];
                cell.style.color = getDistanceColor(cities[idx]);
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '14px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Toggle city placement (simplified)
                if (cities[idx] === -1) {
                    cities[idx] = 0;
                    cell.innerText = '';
                } else if (cities[idx] === 0) {
                    // Place city
                    const ci = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
                    cities[ci] = -1;
                    initMaps(); // Re-render
                }
            };

            board.appendChild(cell);
        }
    }

    checkMapsWin();
}

function getDistanceColor(dist) {
    const colors = ['#d97706', '#f59e0b', '#eab308', '#84cc16', '#10b981'];
    return colors[dist - 1] || '#6b7280';
}

function checkMapsWin() {
    const status = document.getElementById('arrow-status');
    let citiesFound = cities.filter(c => c === -1).length;
    if (citiesFound >= 3) {
        status.innerText = 'Cities placed!';
        status.style.color = 'var(--accent-success)';
    }
}
