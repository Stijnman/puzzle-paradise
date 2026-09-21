// Fifteen sliding puzzle.
// Seeded legal-move scrambling guarantees a solvable position.

const FIFTEEN_SIZE = 4;
let tiles = [];

function fifteenDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function fifteenSolvedTiles() {
    return Array.from({ length: FIFTEEN_SIZE * FIFTEEN_SIZE - 1 }, (_, i) => i + 1).concat(0);
}

function fifteenIsSolved() {
    const target = fifteenSolvedTiles();
    return tiles.every((value, index) => value === target[index]);
}

function fifteenAdjacent(index) {
    const row = Math.floor(index / FIFTEEN_SIZE);
    const col = index % FIFTEEN_SIZE;
    return [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]
        .filter(([r,c]) => r >= 0 && r < FIFTEEN_SIZE && c >= 0 && c < FIFTEEN_SIZE)
        .map(([r,c]) => r * FIFTEEN_SIZE + c);
}

function scrambleFifteen() {
    tiles = fifteenSolvedTiles();
    const moves = { easy:20, medium:60, hard:140, expert:300 }[fifteenDifficulty()];
    let previousBlank = -1;

    for (let step = 0; step < moves; step++) {
        const blank = tiles.indexOf(0);
        const options = fifteenAdjacent(blank).filter(index => index !== previousBlank);
        const source = options[Math.floor(Math.random() * options.length)];
        previousBlank = blank;
        [tiles[blank], tiles[source]] = [tiles[source], tiles[blank]];
    }

    if (fifteenIsSolved()) {
        const blank = tiles.indexOf(0);
        const source = fifteenAdjacent(blank)[0];
        [tiles[blank], tiles[source]] = [tiles[source], tiles[blank]];
    }
}

function initFifteen() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = 'repeat(' + FIFTEEN_SIZE + ',1fr)';
    board.innerHTML = '';
    scrambleFifteen();

    for (let r = 0; r < FIFTEEN_SIZE; r++) {
        for (let c = 0; c < FIFTEEN_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'fifteen-' + r + '-' + c;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => moveFifteenToward(r,c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    moveFifteenToward(r,c);
                }
            };
            board.appendChild(cell);
        }
    }

    renderFifteen();
    checkFifteenWin();
}

function moveFifteenToward(row, col) {
    const target = row * FIFTEEN_SIZE + col;
    let blank = tiles.indexOf(0);
    const blankRow = Math.floor(blank / FIFTEEN_SIZE);
    const blankCol = blank % FIFTEEN_SIZE;

    if (row !== blankRow && col !== blankCol) {
        const status = document.getElementById('arrow-status');
        status.innerText = 'Choose a tile in the same row or column as the empty space.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    if (target === blank) return;

    if (row === blankRow) {
        const direction = Math.sign(col - blankCol);
        while (blank !== target) {
            const source = blank + direction;
            [tiles[blank], tiles[source]] = [tiles[source], tiles[blank]];
            blank = source;
        }
    } else {
        const direction = Math.sign(row - blankRow);
        while (blank !== target) {
            const source = blank + direction * FIFTEEN_SIZE;
            [tiles[blank], tiles[source]] = [tiles[source], tiles[blank]];
            blank = source;
        }
    }

    renderFifteen();
    checkFifteenWin();
}

function renderFifteen() {
    tiles.forEach((value, index) => {
        const row = Math.floor(index / FIFTEEN_SIZE);
        const col = index % FIFTEEN_SIZE;
        const cell = document.getElementById('fifteen-' + row + '-' + col);
        cell.innerText = value || '';
        cell.classList.toggle('empty', value === 0);
        cell.setAttribute(
            'aria-label',
            value
                ? 'Tile ' + value + ', row ' + (row + 1) + ', column ' + (col + 1)
                : 'Empty space, row ' + (row + 1) + ', column ' + (col + 1)
        );
    });
}

function checkFifteenWin() {
    const status = document.getElementById('arrow-status');
    if (fifteenIsSolved()) {
        status.innerText = 'Tiles are in numerical order. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        const level = fifteenDifficulty();
        status.innerText = level[0].toUpperCase() + level.slice(1) + ' · slide tiles into numerical order.';
        status.style.color = '';
    }
}

function fifteenHint() {
    const blank = tiles.indexOf(0);
    const candidates = fifteenAdjacent(blank);
    let best = null;
    let bestScore = Infinity;

    for (const index of candidates) {
        const value = tiles[index];
        const target = value - 1;
        const targetRow = Math.floor(target / FIFTEEN_SIZE);
        const targetCol = target % FIFTEEN_SIZE;
        const score =
            Math.abs(Math.floor(blank / FIFTEEN_SIZE) - targetRow) +
            Math.abs(blank % FIFTEEN_SIZE - targetCol);
        if (score < bestScore) {
            bestScore = score;
            best = index;
        }
    }

    if (best === null) return 'Move a tile next to the empty space.';
    const row = Math.floor(best / FIFTEEN_SIZE);
    const col = best % FIFTEEN_SIZE;
    return {
        message: 'Consider moving tile ' + tiles[best] + ' toward the empty space.',
        selector: '#fifteen-' + row + '-' + col
    };
}

window.PPEngine?.register('fifteen', {
    version: 1,
    serialize: () => ({ version:1, tiles:[...tiles] }),
    restore: snapshot => {
        if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.tiles) || snapshot.tiles.length !== 16) return false;
        tiles = [...snapshot.tiles];
        renderFifteen();
        checkFifteenWin();
        return true;
    },
    validate: () => new Set(tiles).size === 16 && tiles.every(value => Number.isInteger(value) && value >= 0 && value <= 15),
    isSolved: fifteenIsSolved,
    getHint: fifteenHint
});
