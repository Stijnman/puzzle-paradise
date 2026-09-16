// Magnets Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let poles = [];

function initMagnets() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    poles = new Array(BOARD_SIZE * BOARD_SIZE).fill(null);

    // Place magnets: north and south poles that repel/attract
    // Number clues indicate how many magnets in that row/column

    // Initialize with random pole placements
    poles = new Array(BOARD_SIZE * BOARD_SIZE).fill(null);

    // Place 7 North (N) and 7 South (S) poles
    let nPlaced = 0, sPlaced = 0;
    while (nPlaced < 7 || sPlaced < 7) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        if (poles[idx] === null) {
            if (nPlaced < 7) {
                poles[idx] = 'N';
                nPlaced++;
            } else if (sPlaced < 7) {
                poles[idx] = 'S';
                sPlaced++;
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `magnets-${r}-${c}`;

            if (poles[idx] === 'N') {
                cell.innerText = '⊕';
                cell.style.color = '#dc2626';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else if (poles[idx] === 'S') {
                cell.innerText = '⊖';
                cell.style.color = '#1e40af';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else {
                // Show row/column clue (how many magnets)
                let nInRow = 0, sInRow = 0;
                for (let k = 0; k < BOARD_SIZE; k++) {
                    if (poles[r * BOARD_SIZE + k] === 'N') nInRow++;
                    if (poles[r * BOARD_SIZE + k] === 'S') sInRow++;
                }
                cell.innerText = `${nInRow}/${sInRow}`;
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '12px';
                cell.style.background = 'rgba(37, 99, 235, 0.1)';
            }

            cell.onclick = () => {
                // Toggle pole type
                if (poles[idx] === 'N') {
                    poles[idx] = 'S';
                    cell.innerText = '⊖';
                    cell.style.color = '#1e40af';
                } else if (poles[idx] === 'S') {
                    poles[idx] = null;
                    // Recalculate clues
                    let nInRow = 0, sInRow = 0;
                    for (let k = 0; k < BOARD_SIZE; k++) {
                        if (poles[r * BOARD_SIZE + k] === 'N') nInRow++;
                        if (poles[r * BOARD_SIZE + k] === 'S') sInRow++;
                    }
                    cell.innerText = `${nInRow}/${sInRow}`;
                } else {
                    poles[idx] = 'N';
                    cell.innerText = '⊕';
                    cell.style.color = '#dc2626';
                }
                checkMagnetsWin();
            };

            board.appendChild(cell);
        }
    }

    checkMagnetsWin();
}

function checkMagnetsWin() {
    const status = document.getElementById('arrow-status');
    let polesPlaced = poles.filter(p => p !== null).length;
    if (polesPlaced > 0) {
        status.innerText = 'Placing magnets...';
        status.style.color = 'var(--accent-warning)';
    }
}
