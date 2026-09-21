// Null Game
// Original Puzzle Paradise mini-puzzle: reduce every cell to zero.

const BOARD_SIZE = 5;
let grid = [];

function initNullGame() {
    const board = document.getElementById('arrow-board');
    const status = document.getElementById('arrow-status');

    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    grid = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Start from the solved (all-zero) board and apply legal moves.
    // That guarantees every generated position is solvable.
    const scrambleMoves = 7 + Math.floor(Math.random() * 5);
    for (let i = 0; i < scrambleMoves; i++) {
        toggleNullCross(Math.floor(Math.random() * grid.length), false);
    }
    if (grid.every(value => value === 0)) {
        toggleNullCross(Math.floor(grid.length / 2), false);
    }

    for (let index = 0; index < grid.length; index++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.id = `nullgame-${index}`;
        cell.setAttribute('role', 'button');
        cell.setAttribute('tabindex', '0');
        cell.onclick = () => toggleNullCross(index, true);
        cell.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleNullCross(index, true);
            }
        };
        board.appendChild(cell);
    }

    renderNullGame();
    status.innerText = 'Make every cell null. Each move flips a cell and its orthogonal neighbours.';
    status.style.color = '';
}

function toggleNullCross(index, shouldRender) {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const targets = [
        [row, col],
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1]
    ];

    targets.forEach(([r, c]) => {
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return;
        const target = r * BOARD_SIZE + c;
        grid[target] = grid[target] ? 0 : 1;
    });

    if (shouldRender) {
        renderNullGame();
        checkNullGameWin();
    }
}

function renderNullGame() {
    grid.forEach((value, index) => {
        const cell = document.getElementById(`nullgame-${index}`);
        if (!cell) return;

        cell.innerText = value ? '●' : '';
        cell.classList.toggle('empty', value === 0);
        cell.style.background = value
            ? 'linear-gradient(145deg,#4f5fb8,#252f70)'
            : 'rgba(8,10,24,.35)';
        cell.setAttribute(
            'aria-label',
            `${value ? 'Active' : 'Null'} cell row ${Math.floor(index / BOARD_SIZE) + 1}, column ${index % BOARD_SIZE + 1}`
        );
    });
}

function checkNullGameWin() {
    const status = document.getElementById('arrow-status');
    const active = grid.reduce((count, value) => count + value, 0);

    if (active === 0) {
        status.innerText = 'Everything is null. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = `${active} active cell${active === 1 ? '' : 's'} remaining.`;
        status.style.color = '';
    }
}
