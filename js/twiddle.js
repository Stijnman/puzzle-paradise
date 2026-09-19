// Twiddle: rotate 2x2 groups to restore numerical order.
// Scrambling uses legal clockwise rotations; reversing them anticlockwise always solves the board.

const TWIDDLE_SIZE = 4;
let twiddleTiles = [];
let twiddleSolutionMoves = [];

function twiddleDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function twiddleSolvedTiles() {
    return Array.from({ length:TWIDDLE_SIZE * TWIDDLE_SIZE }, (_,i) => i + 1);
}

function rotateTwiddle(row,col,clockwise,render = true) {
    const a = row * TWIDDLE_SIZE + col;
    const b = a + 1;
    const c = a + TWIDDLE_SIZE;
    const d = c + 1;
    const old = [twiddleTiles[a],twiddleTiles[b],twiddleTiles[d],twiddleTiles[c]];

    if (clockwise) {
        twiddleTiles[a] = old[3];
        twiddleTiles[b] = old[0];
        twiddleTiles[d] = old[1];
        twiddleTiles[c] = old[2];
    } else {
        twiddleTiles[a] = old[1];
        twiddleTiles[b] = old[2];
        twiddleTiles[d] = old[3];
        twiddleTiles[c] = old[0];
    }

    if (render) {
        renderTwiddle();
        checkTwiddleWin();
    }
}

function generateTwiddle() {
    twiddleTiles = twiddleSolvedTiles();
    twiddleSolutionMoves = [];
    const count = { easy:4, medium:10, hard:24, expert:50 }[twiddleDifficulty()];
    const scrambles = [];

    for (let i = 0; i < count; i++) {
        const row = Math.floor(Math.random() * (TWIDDLE_SIZE - 1));
        const col = Math.floor(Math.random() * (TWIDDLE_SIZE - 1));
        rotateTwiddle(row,col,true,false);
        scrambles.push({row,col});
    }

    twiddleSolutionMoves = scrambles.reverse();
    if (twiddleIsSolved()) {
        rotateTwiddle(0,0,true,false);
        twiddleSolutionMoves.unshift({row:0,col:0});
    }
}

function initTwiddle() {
    const board = document.getElementById('arrow-board');
    generateTwiddle();
    board.style.gridTemplateColumns = 'repeat(' + TWIDDLE_SIZE + ',1fr)';
    board.innerHTML = '';

    for (let r = 0; r < TWIDDLE_SIZE; r++) {
        for (let c = 0; c < TWIDDLE_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'twiddle-' + r + '-' + c;
            cell.setAttribute('aria-label','Tile at row ' + (r + 1) + ', column ' + (c + 1));

            if (r < TWIDDLE_SIZE - 1 && c < TWIDDLE_SIZE - 1) {
                cell.setAttribute('role','button');
                cell.setAttribute('tabindex','0');
                cell.title = 'Rotate the 2×2 group anchored here anticlockwise';
                cell.onclick = () => playTwiddle(r,c);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        playTwiddle(r,c);
                    }
                };
            }
            board.appendChild(cell);
        }
    }

    renderTwiddle();
    checkTwiddleWin();
}

function playTwiddle(row,col) {
    rotateTwiddle(row,col,false,true);
    const expected = twiddleSolutionMoves[0];
    if (expected && expected.row === row && expected.col === col) twiddleSolutionMoves.shift();
    else twiddleSolutionMoves = [];
}

function renderTwiddle() {
    for (let r = 0; r < TWIDDLE_SIZE; r++) {
        for (let c = 0; c < TWIDDLE_SIZE; c++) {
            const index = r * TWIDDLE_SIZE + c;
            const cell = document.getElementById('twiddle-' + r + '-' + c);
            cell.innerText = twiddleTiles[index];
            cell.style.color = twiddleTiles[index] === index + 1 ? 'var(--accent-success)' : 'var(--primary)';
        }
    }
}

function twiddleIsSolved() {
    return twiddleTiles.every((value,index) => value === index + 1);
}

function checkTwiddleWin() {
    const status = document.getElementById('arrow-status');
    if (twiddleIsSolved()) {
        status.innerText = 'Every tile is in ascending order. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = twiddleDifficulty()[0].toUpperCase() + twiddleDifficulty().slice(1) +
            ' · activate a top-left tile to rotate its 2×2 group anticlockwise.';
        status.style.color = '';
    }
}

function twiddleHint() {
    const next = twiddleSolutionMoves[0];
    if (!next) return 'Look for a 2×2 rotation that places multiple tiles closer to their target positions.';
    return {
        message:'Rotate the highlighted 2×2 group anticlockwise.',
        selector:'#twiddle-' + next.row + '-' + next.col
    };
}

window.PPEngine?.register('twiddle', {
    version:1,
    serialize:() => ({
        version:1,
        tiles:[...twiddleTiles],
        solutionMoves:twiddleSolutionMoves.map(move => ({...move}))
    }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.tiles) || snapshot.tiles.length !== 16) return false;
        twiddleTiles = [...snapshot.tiles];
        twiddleSolutionMoves = (snapshot.solutionMoves || []).map(move => ({...move}));
        renderTwiddle();
        checkTwiddleWin();
        return true;
    },
    validate:() => new Set(twiddleTiles).size === 16,
    isSolved:twiddleIsSolved,
    getHint:twiddleHint
});
