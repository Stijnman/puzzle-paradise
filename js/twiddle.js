// Twiddle Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 5;
let tiles = [];

function initTwiddle() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    tiles = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create tiles with numbers that can be rearranged
    // The goal is to get them in order 1-25

    // Initialize with numbers 1-25 (24 tiles + 1 empty)
    for (let i = 1; i <= 24; i++) {
        tiles[i - 1] = i;
    }
    tiles[24] = 0; // Empty space at end

    // Shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Create cells
    const actualSize = 5; // 5x5 grid
    for (let r = 0; r < actualSize; r++) {
        for (let c = 0; c < actualSize; c++) {
            const idx = r * actualSize + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `twiddle-${r}-${c}`;

            if (tiles[idx] === 0) {
                // Empty space
                cell.innerText = '';
                cell.classList.add('empty');
            } else {
                cell.innerText = tiles[idx];
                cell.style.color = 'var(--primary)';
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '18px';
            }

            cell.onclick = () => {
                // Slide tile into empty space
                const emptyIdx = tiles.indexOf(0);
                const [er, ec] = [Math.floor(emptyIdx / actualSize), emptyIdx % actualSize];
                const [rr, cc] = [r, c];

                if (Math.abs(rr - er) === 1 && cc === ec || Math.abs(cc - ec) === 1 && rr === er) {
                    [tiles[emptyIdx], tiles[idx]] = [tiles[idx], tiles[emptyIdx]];
                    initTwiddle(); // Re-render
                }
            };

            board.appendChild(cell);
        }
    }

    checkTwiddleWin();
}

function checkTwiddleWin() {
    const status = document.getElementById('arrow-status');
    let solved = true;
    for (let i = 0; i < 24; i++) {
        if (tiles[i] !== i + 1) solved = false;
    }
    if (solved && tiles[24] === 0) {
        status.innerText = 'Puzzle Solved!';
        status.style.color = 'var(--accent-success)';
    }
}
