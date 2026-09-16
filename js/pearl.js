// Pearls Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let pearls = [];

function initPearl() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    pearls = new Array(BOARD_SIZE * BOARD_SIZE).fill(null); // null=empty, 'p'=pearl, 'h'=black pearl

    // Place pearls: black pearls must not touch each other orthogonally
    // White pearls indicate the number of adjacent pearls (black or white)
    
    // Simplified: place some pearls
    pearls = new Array(BOARD_SIZE * BOARD_SIZE).fill(null);
    
    // Place 3 white pearls and 2 black pearls randomly
    let placedWhite = 0, placedBlack = 0;
    while (placedWhite < 3 || placedBlack < 2) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        if (pearls[idx] === null) {
            if (placedWhite < 3 && Math.random() > 0.5) {
                pearls[idx] = 'w'; // White pearl
                placedWhite++;
            } else if (placedBlack < 2) {
                pearls[idx] = 'b'; // Black pearl
                placedBlack++;
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `pearl-${r}-${c}`;
            
            if (pearls[idx] === 'w') {
                cell.innerText = '●'; // White pearl
                cell.style.color = '#f3e8ff';
                cell.style.background = '#7c3aed';
                cell.style.fontSize = '18px';
            } else if (pearls[idx] === 'b') {
                cell.innerText = '⬤'; // Black pearl
                cell.style.color = '#1e293b';
                cell.style.background = '#f472b6';
                cell.style.fontSize = '18px';
            } else {
                // Show number of adjacent pearls
                let adjacent = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && pearls[nr * BOARD_SIZE + nc]) {
                            adjacent++;
                        }
                    }
                }
                if (adjacent > 0) {
                    cell.innerText = adjacent;
                    cell.style.color = 'var(--primary)';
                    cell.style.fontWeight = 'bold';
                    cell.style.fontSize = '14px';
                } else {
                    cell.innerText = '';
                }
            }
            
            cell.onclick = () => {
                // Toggle pearl type
                if (pearls[idx] === 'w') {
                    pearls[idx] = 'b';
                    cell.innerText = '⬤';
                    cell.style.color = '#1e293b';
                    cell.style.background = '#f472b6';
                } else if (pearls[idx] === 'b') {
                    pearls[idx] = null;
                    // Recalculate adjacent
                    let adjacent = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && pearls[nr * BOARD_SIZE + nc]) adjacent++;
                        }
                    }
                    if (adjacent > 0) {
                        cell.innerText = adjacent;
                        cell.style.color = 'var(--primary)';
                        cell.style.fontWeight = 'bold';
                        cell.style.fontSize = '14px';
                    } else {
                        cell.innerText = '';
                    }
                } else {
                    pearls[idx] = 'w';
                    cell.innerText = '●';
                    cell.style.color = '#f3e8ff';
                    cell.style.background = '#7c3aed';
                    cell.style.fontSize = '18px';
                }
                checkPearlWin();
            };
            
            board.appendChild(cell);
        }
    }
    
    checkPearlWin();
}

function checkPearlWin() {
    const status = document.getElementById('arrow-status');
    let whitePearls = pearls.filter(p => p === 'w').length;
    if (whitePearls >= 3) {
        status.innerText = 'Pearls placed!';
        status.style.color = 'var(--accent-success)';
    }
}
