// Mines / Minesweeper Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 8;
let grid = [];

function initMines() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Place mines (bombs) randomly
    const numMines = 12;
    let placed = 0;
    while (placed < numMines) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        if (grid[idx] !== -1) {
            grid[idx] = -1; // -1 = mine
            placed++;
        }
    }

    // Calculate numbers (how many adjacent mines)
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (grid[idx] !== -1) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                            if (grid[nr * BOARD_SIZE + nc] === -1) count++;
                        }
                    }
                }
                grid[idx] = count;
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `mines-${r}-${c}`;

            if (grid[idx] === -1) {
                // Mine - hide it initially, or show as clicked
                cell.innerText = '💣';
                cell.style.color = '#dc2626';
                cell.style.fontWeight = 'bold';
                cell.onclick = () => {
                    // Game over
                    status.innerText = 'Game Over!';
                    status.style.color = 'var(--accent-warning)';
                };
            } else if (grid[idx] > 0) {
                cell.innerText = grid[idx];
                const colors = ['#dc2626', '#dc2626', '#1e40af', '#1e40af', '#059669', '#059669', '#7c3aed'];
                cell.style.color = colors[grid[idx] - 1] || '#6b7280';
                cell.style.fontWeight = 'bold';
                cell.onclick = () => {
                    // Reveal cell
                    checkMinesWin();
                };
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
                cell.onclick = () => {
                    // Reveal empty cell and adjacent
                    revealEmpty(r, c);
                    checkMinesWin();
                };
            }

            board.appendChild(cell);
        }
    }
}

function revealEmpty(r, c) {
    // Recursively reveal empty cells
    const stack = [[r, c]];
    const visited = new Set();

    while (stack.length > 0) {
        const [cr, cc] = stack.pop();
        const idx = cr * BOARD_SIZE + cc;
        if (visited.has(idx) || cr < 0 || cr >= BOARD_SIZE || cc < 0 || cc >= BOARD_SIZE) continue;
        visited.add(idx);

        const cell = document.getElementById(`mines-${cr}-${cc}`);
        if (grid[cr * BOARD_SIZE + cc] === 0) {
            cell.innerText = '';
            cell.classList.add('empty');
            // Add neighbors to stack
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr !== 0 || dc !== 0) {
                        stack.push([cr + dr, cc + dc]);
                    }
                }
            }
        } else if (grid[cr * BOARD_SIZE + cc] > 0) {
            cell.innerText = grid[cr * BOARD_SIZE + cc];
            const colors = ['#dc2626', '#dc2626', '#1e40af', '#1e40af', '#059669', '#059669', '#7c3aed'];
            cell.style.color = colors[grid[cr * BOARD_SIZE + cc] - 1] || '#6b7280';
            cell.style.fontWeight = 'bold';
        }
    }
}

function checkMinesWin() {
    const status = document.getElementById('arrow-status');
    let safeRevealed = grid.filter(g => g >= 0 && g !== -1).length - 12; // Adjust
    if (safeRevealed > 0) {
        status.innerText = 'Clearing mines...';
        status.style.color = 'var(--accent-warning)';
    }
}
