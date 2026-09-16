// Light Up / Akari Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 8;
let grid = [];

function initLightUp() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill('empty'); // empty, bulb, lit

    // Place bulbs and lamps: bulbs light up cells, must light all white cells
    // No two bulbs can see each other, bulbs can't be adjacent

    // Initialize: some cells are fixed walls ('#'), rest are empty
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        grid[i] = Math.random() > 0.85 ? 'wall' : 'empty'; // ~15% walls
    }

    // Place bulbs (simplified: randomly place some)
    let bulbsPlaced = 0;
    while (bulbsPlaced < 10) {
        const idx = Math.floor(Math.random() * (BOARD_SIZE * BOARD_SIZE));
        if (grid[idx] === 'empty') {
            grid[idx] = 'bulb';
            bulbsPlaced++;
        }
    }

    // Calculate lit cells (simplified)
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            if (grid[idx] === 'bulb') {
                // Light up in 4 directions until wall
                for (let dc = 1; c + dc < BOARD_SIZE; dc++) {
                    const nIdx = r * BOARD_SIZE + c + dc;
                    if (grid[nIdx] === 'wall') break;
                    grid[nIdx] = 'lit';
                }
                for (let dc = -1; c + dc >= 0; dc--) {
                    const nIdx = r * BOARD_SIZE + c + dc;
                    if (grid[nIdx] === 'wall') break;
                    grid[nIdx] = 'lit';
                }
                for (let dr = 1; r + dr < BOARD_SIZE; dr++) {
                    const nIdx = (r + dr) * BOARD_SIZE + c;
                    if (grid[nIdx] === 'wall') break;
                    grid[nIdx] = 'lit';
                }
                for (let dr = -1; r + dr >= 0; dr--) {
                    const nIdx = (r + dr) * BOARD_SIZE + c;
                    if (grid[nIdx] === 'wall') break;
                    grid[nIdx] = 'lit';
                }
            }
        }
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `lightup-${r}-${c}`;

            if (grid[idx] === 'wall') {
                cell.innerText = '■';
                cell.style.background = '#0f172a';
                cell.style.color = '#6b7280';
                cell.style.fontWeight = 'bold';
            } else if (grid[idx] === 'bulb') {
                cell.innerText = '☀';
                cell.style.color = '#f59e0b';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
                cell.onclick = () => {
                    // Toggle bulb
                    grid[idx] = 'empty';
                    initLightUp(); // Re-render
                };
            } else if (grid[idx] === 'lit') {
                cell.innerText = '.';
                cell.style.color = '#eab308';
                cell.style.fontSize = '12px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
                cell.onclick = () => {
                    // Place bulb
                    grid[idx] = 'bulb';
                    initLightUp();
                };
            }

            board.appendChild(cell);
        }
    }

    checkLightUpWin();
}

function checkLightUpWin() {
    const status = document.getElementById('arrow-status');
    let litCells = grid.filter(g => g === 'lit').length;
    let bulbs = grid.filter(g => g === 'bulb').length;
    if (bulbs > 0 && litCells > 0) {
        status.innerText = 'Lighting grid...';
        status.style.color = 'var(--accent-warning)';
    }
}
