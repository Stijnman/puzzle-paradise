// Mines / Minesweeper.
// Mines are generated after the first move so the opening cell and its neighbours are always safe.

let minesSize = 8;
let mineCount = 12;
let grid = [];
let revealedMinesCells = new Set();
let minesGameOver = false;
let minesGenerated = false;

function minesDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function minesSettings() {
    return {
        easy:{ size:6, mines:6 },
        medium:{ size:7, mines:9 },
        hard:{ size:8, mines:13 },
        expert:{ size:9, mines:18 }
    }[minesDifficulty()];
}

function initMines() {
    const board = document.getElementById('arrow-board');
    const settings = minesSettings();
    minesSize = settings.size;
    mineCount = settings.mines;
    grid = new Array(minesSize * minesSize).fill(0);
    revealedMinesCells = new Set();
    minesGameOver = false;
    minesGenerated = false;

    board.style.gridTemplateColumns = 'repeat(' + minesSize + ',1fr)';
    board.innerHTML = '';

    for (let r = 0; r < minesSize; r++) {
        for (let c = 0; c < minesSize; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'mines-' + r + '-' + c;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.setAttribute('aria-label','Hidden cell row ' + (r + 1) + ', column ' + (c + 1));
            cell.onclick = () => revealMinesCell(r,c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    revealMinesCell(r,c);
                }
            };
            board.appendChild(cell);
        }
    }

    renderMines();
    updateMinesStatus();
}

function minesExcluded(firstIndex) {
    const row = Math.floor(firstIndex / minesSize);
    const col = firstIndex % minesSize;
    const excluded = new Set();

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < minesSize && c >= 0 && c < minesSize) {
                excluded.add(r * minesSize + c);
            }
        }
    }
    return excluded;
}

function generateMines(firstIndex) {
    const excluded = minesExcluded(firstIndex);
    const candidates = Array.from({ length:minesSize * minesSize }, (_,i) => i)
        .filter(index => !excluded.has(index));

    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i],candidates[j]] = [candidates[j],candidates[i]];
    }

    grid.fill(0);
    for (const index of candidates.slice(0,mineCount)) grid[index] = -1;

    for (let r = 0; r < minesSize; r++) {
        for (let c = 0; c < minesSize; c++) {
            const index = r * minesSize + c;
            if (grid[index] === -1) continue;
            grid[index] = adjacentMineIndices(index).filter(next => grid[next] === -1).length;
        }
    }

    minesGenerated = true;
}

function adjacentMineIndices(index) {
    const row = Math.floor(index / minesSize);
    const col = index % minesSize;
    const result = [];

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < minesSize && c >= 0 && c < minesSize) {
                result.push(r * minesSize + c);
            }
        }
    }
    return result;
}

function revealMinesCell(r,c) {
    if (minesGameOver) return;

    const index = r * minesSize + c;
    if (revealedMinesCells.has(index)) return;
    if (!minesGenerated) generateMines(index);

    if (grid[index] === -1) {
        minesGameOver = true;
        renderMines();
        const status = document.getElementById('arrow-status');
        status.innerText = 'Mine hit. Start a new puzzle to try again.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    revealSafeArea(index);
    renderMines();
    checkMinesWin();
}

function revealSafeArea(start) {
    const queue = [start];

    while (queue.length) {
        const index = queue.shift();
        if (revealedMinesCells.has(index) || grid[index] === -1) continue;
        revealedMinesCells.add(index);

        if (grid[index] === 0) {
            for (const next of adjacentMineIndices(index)) {
                if (!revealedMinesCells.has(next) && grid[next] !== -1) queue.push(next);
            }
        }
    }
}

function renderMines() {
    for (let r = 0; r < minesSize; r++) {
        for (let c = 0; c < minesSize; c++) {
            const index = r * minesSize + c;
            const cell = document.getElementById('mines-' + r + '-' + c);
            const revealed = revealedMinesCells.has(index);
            const showMine = minesGameOver && minesGenerated && grid[index] === -1;

            cell.style.color = '';
            cell.classList.toggle('fixed',revealed);
            cell.classList.toggle('empty',revealed && grid[index] === 0);

            if (showMine) {
                cell.innerText = '💣';
                cell.style.color = '#ef4444';
                cell.setAttribute('aria-label','Mine');
            } else if (revealed) {
                cell.innerText = grid[index] > 0 ? String(grid[index]) : '';
                cell.setAttribute(
                    'aria-label',
                    grid[index] > 0 ? grid[index] + ' adjacent mines' : 'Revealed empty cell'
                );
            } else {
                cell.innerText = '';
                cell.setAttribute('aria-label','Hidden cell row ' + (r + 1) + ', column ' + (c + 1));
            }
        }
    }
}

function minesSolved() {
    return minesGenerated &&
        !minesGameOver &&
        revealedMinesCells.size === minesSize * minesSize - mineCount;
}

function checkMinesWin() {
    const status = document.getElementById('arrow-status');

    if (minesSolved()) {
        minesGameOver = true;
        status.innerText = 'All safe cells revealed. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        updateMinesStatus();
    }
}

function updateMinesStatus() {
    const status = document.getElementById('arrow-status');
    const safe = minesSize * minesSize - mineCount;
    const remaining = safe - revealedMinesCells.size;
    const level = minesDifficulty();
    status.innerText =
        level[0].toUpperCase() + level.slice(1) + ' · ' +
        remaining + ' safe cell' + (remaining === 1 ? '' : 's') + ' remaining.';
    status.style.color = '';
}

function minesHint() {
    if (!minesGenerated) return 'Your first move is guaranteed safe, including its neighbouring cells.';

    for (let index = 0; index < grid.length; index++) {
        if (revealedMinesCells.has(index) || grid[index] === -1) continue;
        const row = Math.floor(index / minesSize);
        const col = index % minesSize;
        return {
            message:'A safe cell is highlighted. Use nearby revealed numbers to explain why before opening it.',
            selector:'#mines-' + row + '-' + col
        };
    }
    return 'No hidden safe cells remain.';
}

window.PPEngine?.register('mines', {
    version:1,
    serialize:() => ({
        version:1,
        size:minesSize,
        mineCount,
        grid:[...grid],
        revealed:[...revealedMinesCells],
        generated:minesGenerated,
        gameOver:minesGameOver
    }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || snapshot.size !== minesSize || !Array.isArray(snapshot.grid)) return false;
        mineCount = snapshot.mineCount;
        grid = [...snapshot.grid];
        revealedMinesCells = new Set(snapshot.revealed || []);
        minesGenerated = Boolean(snapshot.generated);
        minesGameOver = Boolean(snapshot.gameOver);
        renderMines();
        if (minesSolved()) checkMinesWin();
        else if (minesGameOver) {
            const status = document.getElementById('arrow-status');
            status.innerText = 'Mine hit. Start a new puzzle to try again.';
            status.style.color = 'var(--accent-warning)';
        } else updateMinesStatus();
        return true;
    },
    validate:() => grid.length === minesSize * minesSize,
    isSolved:minesSolved,
    getHint:minesHint
});
