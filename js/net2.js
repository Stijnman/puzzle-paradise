// Net / Map Connection Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 5;
let connections = [];

function initNet() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    connections = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create pipe connections - each number connects to another same number
    // The goal is to connect all pairs

    // Create pairs: numbers 1-12 (24 cells for 12 pairs, but 5x5=25... use some as empty)
    connections = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Place 6 pairs (12 cells with numbers, rest empty)
    const pairCount = 6;
    let placedPairs = 0;
    let usedNumbers = [];

    while (placedPairs < pairCount) {
        const num = Math.floor(Math.random() * 9) + 1; // 1-9
        if (!usedNumbers.includes(num)) {
            usedNumbers.push(num);
            // Place two cells with this number
            let placedThisPair = 0;
            while (placedThisPair < 2) {
                const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
                if (connections[idx] === 0) {
                    connections[idx] = num;
                    placedThisPair++;
                }
            }
            placedPairs++;
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `net2-${r}-${c}`;

            if (connections[idx]) {
                cell.innerText = connections[idx];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Toggle connection marker
                if (connections[idx]) {
                    connections[idx] = 0;
                    cell.innerText = '';
                } else {
                    connections[idx] = connections[idx] || 1;
                    cell.innerText = connections[idx];
                    cell.style.color = 'var(--primary)';
                    cell.style.fontWeight = 'bold';
                }
                checkNetWin();
            };

            board.appendChild(cell);
        }
    }

    checkNetWin();
}

function checkNetWin() {
    const status = document.getElementById('arrow-status');
    let connected = connections.filter(c => c > 0).length;
    if (connected > 0 && connected < 15) {
        status.innerText = 'Connecting pairs...';
        status.style.color = 'var(--accent-warning)';
    } else if (connected >= 15) {
        status.innerText = 'All pairs connected! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
