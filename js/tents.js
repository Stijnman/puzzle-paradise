// Tents Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 8;
let grid = [];

function initTents() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Place trees (fixed) and tents
    // Each tree has exactly one adjacent tent (horizontally or vertically)
    // No two tents can touch, not even diagonally

    // Initialize: some cells are trees ('T'), most are empty
    // We'll place 10 tents for an 8x8 grid
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill('empty');

    // Place 10 trees randomly
    let treesPlaced = 0;
    while (treesPlaced < 10) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        if (grid[idx] === 'empty') {
            grid[idx] = 'tree';
            treesPlaced++;
        }
    }

    // Place tents adjacent to trees
    let tentsPlaced = 0;
    while (tentsPlaced < 10) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        const r = Math.floor(idx / BOARD_SIZE);
        const c = idx % BOARD_SIZE;

        if (grid[idx] === 'empty') {
            // Check if adjacent to a tree
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            let adjacentToTree = false;
            for (const [dr, dc] of directions) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    const nIdx = nr * BOARD_SIZE + nc;
                    if (grid[nIdx] === 'tree') {
                        adjacentToTree = true;
                        break;
                    }
                }
            }

            if (adjacentToTree) {
                grid[idx] = 'tent';
                tentsPlaced++;
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `tents-${r}-${c}`;

            if (grid[idx] === 'tree') {
                cell.innerText = '🌳';
                cell.style.color = '#1e293b';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '14px';
            } else if (grid[idx] === 'tent') {
                cell.innerText = '⛺';
                cell.style.color = '#dc2626';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '14px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Toggle tent (simplified)
                if (grid[idx] === 'tent') {
                    // Find adjacent tree and remove tent
                    const r = Math.floor(idx / BOARD_SIZE);
                    const c = idx % BOARD_SIZE;
                    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (const [dr, dc] of directions) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                            const nIdx = nr * BOARD_SIZE + nc;
                            if (grid[nIdx] === 'tree') {
                                grid[nIdx] = 'empty';
                                break;
                            }
                        }
                    }
                    grid[idx] = 'empty';
                } else {
                    grid[idx] = 'tent';
                }
                initTents(); // Re-render
            };

            board.appendChild(cell);
        }
    }

    checkTentsWin();
}

function checkTentsWin() {
    const status = document.getElementById('arrow-status');
    let tents = grid.filter(g => g === 'tent').length;
    if (tents > 0) {
        status.innerText = 'Placing tents...';
        status.style.color = 'var(--accent-warning)';
    }
}
