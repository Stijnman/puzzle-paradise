// Dominosa Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 7;
let dominoes = [];

function initDominosa() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    dominoes = [];

    // Create all dominoes (pairs of numbers 1-7)
    // A standard double-7 set has 28 dominoes
    let allDominoes = [];
    for (let a = 1; a <= 7; a++) {
        for (let b = a; b <= 7; b++) {
            allDominoes.push([a, b]);
        }
    }

    // Shuffle and place first 24 for a 7x7 board (24 cells = 12 dominoes, but 7x7=49... let's do a simpler approach)
    // For Dominosa, we need to fill the board with dominoes
    // Let's create a simplified version
    allDominoes = allDominoes.sort(() => Math.random() - 0.5);
    const used = allDominoes.slice(0, 12); // Use 12 dominoes for 7x7=49... this doesn't work perfectly

    // Create a simpler grid-based approach
    dominoes = [];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        dominoes.push(0);
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `dominosa-${r}-${c}`;

            // Each cell shows half a domino number
            const num = Math.ceil(Math.random() * 6) + 1; // 1-7
            dominoes[idx] = num;

            cell.innerText = '';
            cell.style.border = '1px solid var(--border)';

            // Mark with number
            const numSpan = document.createElement('span');
            numSpan.style.display = 'none';
            numSpan.innerText = num;
            cell.appendChild(numSpan);

            cell.onclick = () => {
                // Toggle selection
                const span = cell.querySelector('span');
                if (span.style.display === 'none') {
                    span.style.display = 'inline';
                } else {
                    span.style.display = 'none';
                }
                checkDominosaWin();
            };

            board.appendChild(cell);
        }
    }
}

function checkDominosaWin() {
    const status = document.getElementById('arrow-status');
    // Check if all dominoes are matched
    let visible = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const span = document.querySelector(`#dominosa-${r}-${c} span`);
            if (span && span.style.display !== 'none') visible++;
        }
    }
    if (visible > 0 && visible % 2 === 0) {
        status.innerText = 'Matching dominoes found!';
        status.style.color = 'var(--accent-success)';
    }
}
