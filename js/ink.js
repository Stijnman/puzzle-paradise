// Ink Trail - an original Puzzle Paradise path-connection puzzle.
// Matching endpoints must be connected by non-crossing paths that cover every cell.

let inkSize = 6;
let inkPairCount = 4;
let inkSolutions = [];
let inkPaths = [];
let inkActive = null;

const INK_COLORS = ['#ef4444','#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16'];

function inkDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function inkSettings() {
    return {
        easy:{size:5,pairs:3},
        medium:{size:6,pairs:4},
        hard:{size:7,pairs:5},
        expert:{size:8,pairs:6}
    }[inkDifficulty()];
}

function transformInkPoint(row,col,rotation,mirror) {
    let r = row;
    let c = mirror ? inkSize - 1 - col : col;
    for (let i = 0; i < rotation; i++) {
        [r,c] = [c,inkSize - 1 - r];
    }
    return [r,c];
}

function generateInkSolution() {
    const settings = inkSettings();
    inkSize = settings.size;
    inkPairCount = settings.pairs;

    const snake = [];
    for (let row = 0; row < inkSize; row++) {
        const cols = Array.from({length:inkSize},(_,i)=>i);
        if (row % 2) cols.reverse();
        for (const col of cols) snake.push([row,col]);
    }

    const rotation = Math.floor(Math.random() * 4);
    const mirror = Math.random() < .5;
    const transformed = snake.map(([r,c]) => transformInkPoint(r,c,rotation,mirror));

    const total = transformed.length;
    const base = Math.floor(total / inkPairCount);
    const remainder = total % inkPairCount;
    inkSolutions = [];
    let offset = 0;

    for (let pair = 0; pair < inkPairCount; pair++) {
        const length = base + (pair < remainder ? 1 : 0);
        const cells = transformed.slice(offset,offset + length)
            .map(([r,c]) => r * inkSize + c);
        inkSolutions.push(cells);
        offset += length;
    }

    inkPaths = inkSolutions.map(path => [path[0]]);
    inkActive = null;
}

function initInk() {
    const board = document.getElementById('arrow-board');
    generateInkSolution();
    board.style.gridTemplateColumns = 'repeat(' + inkSize + ',1fr)';
    board.innerHTML = '';

    for (let row = 0; row < inkSize; row++) {
        for (let col = 0; col < inkSize; col++) {
            const index = row * inkSize + col;
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = 'ink-' + row + '-' + col;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => playInk(index);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    playInk(index);
                }
            };
            board.appendChild(cell);
        }
    }

    renderInk();
    checkInkWin();
}

function inkEndpoint(index) {
    for (let pair = 0; pair < inkSolutions.length; pair++) {
        const solution = inkSolutions[pair];
        if (index === solution[0]) return {pair,type:'start'};
        if (index === solution[solution.length - 1]) return {pair,type:'target'};
    }
    return null;
}

function inkOwner(index) {
    for (let pair = 0; pair < inkPaths.length; pair++) {
        if (inkPaths[pair].includes(index)) return pair;
    }
    return null;
}

function inkAdjacent(a,b) {
    const ar = Math.floor(a / inkSize), ac = a % inkSize;
    const br = Math.floor(b / inkSize), bc = b % inkSize;
    return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

function playInk(index) {
    const endpoint = inkEndpoint(index);
    const owner = inkOwner(index);
    const status = document.getElementById('arrow-status');

    if (endpoint?.type === 'start') {
        inkActive = endpoint.pair;
        renderInk();
        checkInkWin();
        return;
    }

    if (owner !== null) {
        inkActive = owner;
        const path = inkPaths[owner];
        if (path.length > 1 && index === path[path.length - 2]) {
            path.pop();
        }
        renderInk();
        checkInkWin();
        return;
    }

    if (inkActive === null) {
        status.innerText = 'Select a lettered start endpoint before drawing a path.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    const path = inkPaths[inkActive];
    const last = path[path.length - 1];
    if (!inkAdjacent(last,index)) {
        status.innerText = 'Ink paths grow one orthogonally adjacent cell at a time.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    const target = inkSolutions[inkActive][inkSolutions[inkActive].length - 1];
    const clickedEndpoint = inkEndpoint(index);
    if (clickedEndpoint && !(clickedEndpoint.pair === inkActive && index === target)) {
        status.innerText = 'Paths may not pass through another pair’s endpoint.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    path.push(index);
    if (index === target) inkActive = null;
    renderInk();
    checkInkWin();
}

function inkCompleted(pair) {
    const solution = inkSolutions[pair];
    const path = inkPaths[pair];
    return path[path.length - 1] === solution[solution.length - 1];
}

function inkSolved() {
    if (!inkSolutions.length) return false;
    if (!inkSolutions.every((_,pair) => inkCompleted(pair))) return false;
    const covered = new Set(inkPaths.flat());
    return covered.size === inkSize * inkSize;
}

function renderInk() {
    const endpointLabels = 'ABCDEFGH';

    for (let row = 0; row < inkSize; row++) {
        for (let col = 0; col < inkSize; col++) {
            const index = row * inkSize + col;
            const cell = document.getElementById('ink-' + row + '-' + col);
            const endpoint = inkEndpoint(index);
            const owner = inkOwner(index);

            cell.innerText = '';
            cell.style.background = 'rgba(8,10,24,.35)';
            cell.style.color = '';
            cell.classList.add('empty');
            cell.classList.remove('selected');

            if (owner !== null) {
                cell.style.background = INK_COLORS[owner] + '55';
                cell.style.color = INK_COLORS[owner];
                cell.innerText = '●';
                cell.classList.remove('empty');
            }

            if (endpoint) {
                cell.innerText = endpointLabels[endpoint.pair];
                cell.style.background = INK_COLORS[endpoint.pair] + '88';
                cell.style.color = '#fff';
                cell.classList.remove('empty');
            }

            if (inkActive !== null && owner === inkActive) cell.classList.add('selected');

            cell.setAttribute(
                'aria-label',
                endpoint
                    ? 'Ink endpoint ' + endpointLabels[endpoint.pair] + ', row ' + (row + 1) + ', column ' + (col + 1)
                    : owner !== null
                        ? 'Ink path ' + endpointLabels[owner] + ', row ' + (row + 1) + ', column ' + (col + 1)
                        : 'Empty cell row ' + (row + 1) + ', column ' + (col + 1)
            );
        }
    }
}

function checkInkWin() {
    const status = document.getElementById('arrow-status');
    const completed = inkSolutions.filter((_,pair) => inkCompleted(pair)).length;
    const covered = new Set(inkPaths.flat()).size;

    if (inkSolved()) {
        status.innerText = 'Every matching endpoint is connected and the board is fully inked. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText =
            inkDifficulty()[0].toUpperCase() + inkDifficulty().slice(1) +
            ' · ' + completed + '/' + inkPairCount + ' pairs connected · ' +
            covered + '/' + (inkSize * inkSize) + ' cells covered.';
        status.style.color = '';
    }
}

function inkHint() {
    let pair = inkActive;
    if (pair === null) pair = inkSolutions.findIndex((_,index) => !inkCompleted(index));
    if (pair < 0) return 'Every pair is connected. Fill any remaining uncovered cells.';

    const current = inkPaths[pair];
    const solution = inkSolutions[pair];
    const isPrefix = current.every((value,index) => solution[index] === value);

    if (!isPrefix) {
        return 'This path has left one known solution route; backtrack until it can rejoin open space.';
    }

    const next = solution[current.length];
    if (next === undefined) return 'This colour is complete; select another endpoint.';
    const row = Math.floor(next / inkSize);
    const col = next % inkSize;
    return {
        message:'The known solution continues through the highlighted cell.',
        selector:'#ink-' + row + '-' + col
    };
}

window.PPEngine?.register('ink', {
    version:1,
    serialize:() => ({
        version:1,
        size:inkSize,
        pairCount:inkPairCount,
        solutions:inkSolutions.map(path => [...path]),
        paths:inkPaths.map(path => [...path]),
        active:inkActive
    }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || snapshot.size !== inkSize || !Array.isArray(snapshot.paths)) return false;
        inkPairCount = snapshot.pairCount;
        inkSolutions = snapshot.solutions.map(path => [...path]);
        inkPaths = snapshot.paths.map(path => [...path]);
        inkActive = snapshot.active ?? null;
        renderInk();
        checkInkWin();
        return true;
    },
    validate:() => {
        const occupied = inkPaths.flat();
        return new Set(occupied).size === occupied.length;
    },
    isSolved:inkSolved,
    getHint:inkHint
});
