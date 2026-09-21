// Same Game.
// Generated columns are composed of removable runs, guaranteeing at least one clearing sequence.

let sameSize = 7;
let sameColours = 4;
let grid = [];
let selectedGroup = new Set();
let sameScore = 0;
let sameFinished = false;

function sameDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function sameSettings() {
    return {
        easy:{ size:6, colours:3 },
        medium:{ size:7, colours:4 },
        hard:{ size:8, colours:5 },
        expert:{ size:9, colours:6 }
    }[sameDifficulty()];
}

function runPartition(length) {
    const parts = [];
    let remaining = length;

    while (remaining > 0) {
        if (remaining <= 4) {
            parts.push(remaining);
            break;
        }
        const choices = [2,3,4].filter(size => remaining - size !== 1);
        const size = choices[Math.floor(Math.random() * choices.length)];
        parts.push(size);
        remaining -= size;
    }
    return parts;
}

function generateSameGame() {
    const settings = sameSettings();
    sameSize = settings.size;
    sameColours = settings.colours;
    grid = new Array(sameSize * sameSize).fill(0);

    for (let col = 0; col < sameSize; col++) {
        let row = 0;
        let previous = 0;

        for (const length of runPartition(sameSize)) {
            const choices = Array.from({ length:sameColours }, (_,i) => i + 1)
                .filter(value => value !== previous);
            const colour = choices[Math.floor(Math.random() * choices.length)];
            previous = colour;

            for (let i = 0; i < length; i++) {
                grid[(row + i) * sameSize + col] = colour;
            }
            row += length;
        }
    }
}

function initSameGame() {
    const board = document.getElementById('arrow-board');
    generateSameGame();
    board.style.gridTemplateColumns = 'repeat(' + sameSize + ',1fr)';
    board.innerHTML = '';
    selectedGroup = new Set();
    sameScore = 0;
    sameFinished = false;

    for (let r = 0; r < sameSize; r++) {
        for (let c = 0; c < sameSize; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'samegame-' + r + '-' + c;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => selectSameGroup(r,c);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectSameGroup(r,c);
                }
            };
            board.appendChild(cell);
        }
    }

    renderSameGame();
    updateSameStatus();
}

function sameGroupAt(row,col) {
    const start = row * sameSize + col;
    const colour = grid[start];
    if (!colour) return new Set();

    const group = new Set([start]);
    const queue = [start];

    while (queue.length) {
        const current = queue.shift();
        const currentRow = Math.floor(current / sameSize);
        const currentCol = current % sameSize;

        for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nextRow = currentRow + dr;
            const nextCol = currentCol + dc;
            if (nextRow < 0 || nextRow >= sameSize || nextCol < 0 || nextCol >= sameSize) continue;
            const next = nextRow * sameSize + nextCol;
            if (!group.has(next) && grid[next] === colour) {
                group.add(next);
                queue.push(next);
            }
        }
    }

    return group;
}

function sameGroupsEqual(a,b) {
    return a.size === b.size && [...a].every(value => b.has(value));
}

function selectSameGroup(row,col) {
    if (sameFinished) return;

    const group = sameGroupAt(row,col);
    const status = document.getElementById('arrow-status');

    if (group.size < 2) {
        selectedGroup = new Set();
        renderSameGame();
        status.innerText = 'Single squares cannot be removed.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    if (sameGroupsEqual(group, selectedGroup)) {
        removeSameGroup(group);
        selectedGroup = new Set();
        collapseSameGame();
        renderSameGame();
        updateSameStatus();
    } else {
        selectedGroup = group;
        renderSameGame();
        status.innerText = group.size + ' connected squares selected. Activate the group again to remove it.';
        status.style.color = '';
    }
}

function removeSameGroup(group) {
    for (const index of group) grid[index] = 0;
    sameScore += (group.size - 2) * (group.size - 2);
}

function collapseSameGame() {
    const columns = [];

    for (let col = 0; col < sameSize; col++) {
        const values = [];
        for (let row = sameSize - 1; row >= 0; row--) {
            const value = grid[row * sameSize + col];
            if (value) values.push(value);
        }
        if (values.length) columns.push(values);
    }

    grid.fill(0);
    columns.forEach((values,col) => {
        values.forEach((value,offset) => {
            const row = sameSize - 1 - offset;
            grid[row * sameSize + col] = value;
        });
    });
}

function sameHasMoves() {
    for (let r = 0; r < sameSize; r++) {
        for (let c = 0; c < sameSize; c++) {
            const value = grid[r * sameSize + c];
            if (!value) continue;
            if (c + 1 < sameSize && grid[r * sameSize + c + 1] === value) return true;
            if (r + 1 < sameSize && grid[(r + 1) * sameSize + c] === value) return true;
        }
    }
    return false;
}

function renderSameGame() {
    const colors = ['','#e74c3c','#3b82f6','#10b981','#8b5cf6','#f59e0b','#ec4899'];

    for (let r = 0; r < sameSize; r++) {
        for (let c = 0; c < sameSize; c++) {
            const idx = r * sameSize + c;
            const cell = document.getElementById('samegame-' + r + '-' + c);
            const value = grid[idx];
            cell.innerText = value ? '●' : '';
            cell.style.background = value ? colors[value] : 'rgba(8,10,24,.22)';
            cell.style.color = value ? 'white' : '';
            cell.classList.toggle('empty', !value);
            cell.classList.toggle('selected', selectedGroup.has(idx));
            cell.setAttribute(
                'aria-label',
                value
                    ? 'Colour ' + value + ', row ' + (r + 1) + ', column ' + (c + 1)
                    : 'Empty row ' + (r + 1) + ', column ' + (c + 1)
            );
        }
    }
}

function updateSameStatus() {
    const status = document.getElementById('arrow-status');
    const remaining = grid.filter(Boolean).length;

    if (remaining === 0) {
        sameFinished = true;
        status.innerText = 'Board cleared with ' + sameScore + ' points. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (!sameHasMoves()) {
        sameFinished = true;
        status.innerText = 'No removable groups remain. Final score: ' + sameScore + '.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = remaining + ' squares remain · score ' + sameScore + '.';
        status.style.color = '';
    }
}

function sameHint() {
    let best = new Set();

    for (let r = 0; r < sameSize; r++) {
        for (let c = 0; c < sameSize; c++) {
            const group = sameGroupAt(r,c);
            if (group.size > best.size) best = group;
        }
    }

    if (best.size < 2) return 'No removable group remains.';
    const first = [...best][0];
    const row = Math.floor(first / sameSize);
    const col = first % sameSize;
    return {
        message: 'The largest current group contains ' + best.size + ' squares.',
        selector: '#samegame-' + row + '-' + col
    };
}

window.PPEngine?.register('samegame', {
    version:1,
    serialize:() => ({
        version:1,
        size:sameSize,
        colours:sameColours,
        grid:[...grid],
        score:sameScore,
        selected:[...selectedGroup],
        finished:sameFinished
    }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.grid) || !Number.isInteger(snapshot.size)) return false;
        sameSize = snapshot.size;
        sameColours = snapshot.colours;
        grid = [...snapshot.grid];
        sameScore = snapshot.score || 0;
        selectedGroup = new Set(snapshot.selected || []);
        sameFinished = Boolean(snapshot.finished);
        renderSameGame();
        updateSameStatus();
        return true;
    },
    validate:() => grid.length === sameSize * sameSize,
    isSolved:() => grid.every(value => value === 0),
    getHint:sameHint
});
