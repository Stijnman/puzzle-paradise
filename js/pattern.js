// Pattern / Numbered Pipes Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let pipes = [];

function initPattern() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    pipes = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create pipes with numbers indicating turns
    // Each pipe segment has a number showing how many turns it makes

    // Initialize with random pipe rotations
    pipes = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        pipes[i] = Math.floor(Math.random() * 4); // 0:up, 1:right, 2:down, 3:left
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `pattern-${r}-${c}`;

            if (pipes[idx]) {
                // Show pipe character based on rotation
                const pipeChars = ['↑', '→', '↓', '←'];
                cell.innerText = pipeChars[pipes[idx]];
                cell.style.color = 'var(--primary)';
                cell.style.fontSize = '20px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Rotate pipe
                if (pipes[idx]) {
                    pipes[idx] = (pipes[idx] + 1) % 4;
                } else {
                    pipes[idx] = 0; // Start with up
                }
                cell.innerText = pipeChars[pipes[idx]];
                checkPatternWin();
            };

            board.appendChild(cell);
        }
    }

    checkPatternWin();
}

function checkPatternWin() {
    const status = document.getElementById('arrow-status');
    let segments = pipes.filter(p => p >= 0).length;
    if (segments > 0) {
        status.innerText = 'Configuring pipes...';
        status.style.color = 'var(--accent-warning)';
    }
}
