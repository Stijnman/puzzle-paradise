// Flip: cross-neighbour toggling puzzle.
// Generated from the all-lit target by legal moves, so every board is solvable.

let flipSize = 5;
let flipGrid = [];
let flipNeeded = new Set();

function flipDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function flipSettings() {
    return {
        easy:{ size:4, moves:4 },
        medium:{ size:5, moves:7 },
        hard:{ size:6, moves:11 },
        expert:{ size:7, moves:16 }
    }[flipDifficulty()];
}

function flipCross(index, trackSolution = true) {
    const row = Math.floor(index / flipSize);
    const col = index % flipSize;

    for (const [dr,dc] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]]) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= flipSize || c < 0 || c >= flipSize) continue;
        const target = r * flipSize + c;
        flipGrid[target] = !flipGrid[target];
    }

    if (trackSolution) {
        if (flipNeeded.has(index)) flipNeeded.delete(index);
        else flipNeeded.add(index);
    }
}

function generateFlip() {
    const settings = flipSettings();
    flipSize = settings.size;
    flipGrid = new Array(flipSize * flipSize).fill(true);
    flipNeeded = new Set();

    const indices = Array.from({ length:flipGrid.length }, (_,i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i],indices[j]] = [indices[j],indices[i]];
    }

    for (const index of indices.slice(0,Math.min(settings.moves,indices.length))) {
        flipCross(index,true);
    }

    if (flipGrid.every(Boolean)) flipCross(indices[0],true);
}

function initFlip() {
    const board = document.getElementById('arrow-board');
    generateFlip();
    board.style.gridTemplateColumns = 'repeat(' + flipSize + ',1fr)';
    board.innerHTML = '';

    for (let r = 0; r < flipSize; r++) {
        for (let c = 0; c < flipSize; c++) {
            const index = r * flipSize + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'flip-' + r + '-' + c;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => playFlip(index);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    playFlip(index);
                }
            };
            board.appendChild(cell);
        }
    }

    renderFlip();
    checkFlipWin();
}

function playFlip(index) {
    flipCross(index,true);
    renderFlip();
    checkFlipWin();
}

function renderFlip() {
    for (let r = 0; r < flipSize; r++) {
        for (let c = 0; c < flipSize; c++) {
            const index = r * flipSize + c;
            const cell = document.getElementById('flip-' + r + '-' + c);
            const lit = flipGrid[index];
            cell.innerText = lit ? '✦' : '·';
            cell.style.background = lit ? 'rgba(250,204,21,.28)' : 'rgba(8,10,24,.55)';
            cell.style.color = lit ? '#facc15' : '#64748b';
            cell.setAttribute(
                'aria-label',
                (lit ? 'Lit' : 'Dark') + ' cell row ' + (r + 1) + ', column ' + (c + 1)
            );
        }
    }
}

function flipSolved() {
    return flipGrid.every(Boolean);
}

function checkFlipWin() {
    const status = document.getElementById('arrow-status');
    if (flipSolved()) {
        status.innerText = 'Every square is lit. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = flipDifficulty()[0].toUpperCase() + flipDifficulty().slice(1) +
            ' · each move flips a cell and its orthogonal neighbours.';
        status.style.color = '';
    }
}

function flipHint() {
    const index = flipNeeded.values().next().value;
    if (index === undefined) return 'All required flips have been accounted for.';
    const row = Math.floor(index / flipSize);
    const col = index % flipSize;
    return {
        message:'One solution includes flipping the highlighted cell.',
        selector:'#flip-' + row + '-' + col
    };
}

window.PPEngine?.register('flip', {
    version:1,
    serialize:() => ({
        version:1,
        size:flipSize,
        grid:[...flipGrid],
        needed:[...flipNeeded]
    }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || snapshot.size !== flipSize || !Array.isArray(snapshot.grid)) return false;
        flipGrid = snapshot.grid.map(Boolean);
        flipNeeded = new Set(snapshot.needed || []);
        renderFlip();
        checkFlipWin();
        return true;
    },
    validate:() => flipGrid.length === flipSize * flipSize,
    isSolved:flipSolved,
    getHint:flipHint
});
