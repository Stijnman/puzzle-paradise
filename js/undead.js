// Undead / Netwalk Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 8;
let network = [];

function initUndead() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    network = new Array(BOARD_SIZE * BOARD_SIZE).fill('closed'); // closed, open, endpoint

    // Create network: each computer must be connected to power
    // Some connections are pre-placed, some need to be opened

    // Initialize: some links are open, some closed
    const numOpen = 15;
    let openPlaced = 0;

    // Create a grid of cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            network[idx] = 'closed';
        }
    }

    // Open some random links
    while (openPlaced < numOpen) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        if (network[idx] === 'closed') {
            network[idx] = 'open';
            openPlaced++;
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `undead-${r}-${c}`;

            if (network[idx] === 'open') {
                cell.innerText = '●';
                cell.style.color = '#10b981';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            } else if (network[idx] === 'closed') {
                cell.innerText = '○';
                cell.style.color = '#6b7280';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '14px';
            } else {
                cell.innerText = ' power ';
                cell.style.color = '#dc2626';
                cell.style.background = 'white';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '12px';
            }

            cell.onclick = () => {
                // Toggle connection state
                if (network[idx] === 'closed') {
                    network[idx] = 'open';
                    cell.innerText = '●';
                    cell.style.color = '#10b981';
                } else {
                    network[idx] = 'closed';
                    cell.innerText = '○';
                    cell.style.color = '#6b7280';
                }
                checkUndeadWin();
            };

            board.appendChild(cell);
        }
    }

    checkUndeadWin();
}

function checkUndeadWin() {
    const status = document.getElementById('arrow-status');
    let openLinks = network.filter(n => n === 'open').length;
    if (openLinks > 10) {
        status.innerText = 'Network connecting...';
        status.style.color = 'var(--accent-warning)';
    } else if (openLinks >= 20) {
        status.innerText = 'All computers powered! Puzzle Solved.';
        status.style.color = 'var(--accent-success)';
    }
}
