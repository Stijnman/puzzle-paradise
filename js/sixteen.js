// Sixteen cyclic row/column sliding puzzle.

const SIXTEEN_SIZE = 4;
let sixteenTiles = [];

function sixteenDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function sixteenSolved() {
    return Array.from({ length:SIXTEEN_SIZE * SIXTEEN_SIZE }, (_,i) => i + 1);
}

function sixteenIsSolved() {
    return sixteenTiles.every((value,index) => value === index + 1);
}

function shiftSixteenRow(row,direction,render = true) {
    const start = row * SIXTEEN_SIZE;
    const values = sixteenTiles.slice(start,start + SIXTEEN_SIZE);
    if (direction < 0) values.push(values.shift());
    else values.unshift(values.pop());
    values.forEach((value,col) => { sixteenTiles[start + col] = value; });
    if (render) {
        renderSixteen();
        checkSixteenWin();
    }
}

function shiftSixteenColumn(col,direction,render = true) {
    const values = Array.from({ length:SIXTEEN_SIZE }, (_,row) =>
        sixteenTiles[row * SIXTEEN_SIZE + col]
    );
    if (direction < 0) values.push(values.shift());
    else values.unshift(values.pop());
    values.forEach((value,row) => { sixteenTiles[row * SIXTEEN_SIZE + col] = value; });
    if (render) {
        renderSixteen();
        checkSixteenWin();
    }
}

function scrambleSixteen() {
    sixteenTiles = sixteenSolved();
    const count = { easy:4, medium:12, hard:30, expert:70 }[sixteenDifficulty()];
    let lastKind = '';
    let lastIndex = -1;
    let lastDirection = 0;

    for (let i = 0; i < count; i++) {
        let kind;
        let index;
        let direction;

        do {
            kind = Math.random() < 0.5 ? 'row' : 'col';
            index = Math.floor(Math.random() * SIXTEEN_SIZE);
            direction = Math.random() < 0.5 ? -1 : 1;
        } while (
            kind === lastKind &&
            index === lastIndex &&
            direction === -lastDirection
        );

        if (kind === 'row') shiftSixteenRow(index,direction,false);
        else shiftSixteenColumn(index,direction,false);

        lastKind = kind;
        lastIndex = index;
        lastDirection = direction;
    }

    if (sixteenIsSolved()) shiftSixteenRow(0,1,false);
}

function sixteenArrow(board,symbol,handler,label) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.innerText = symbol;
    cell.setAttribute('role','button');
    cell.setAttribute('tabindex','0');
    cell.setAttribute('aria-label',label);
    cell.onclick = handler;
    cell.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handler();
        }
    };
    board.appendChild(cell);
}

function sixteenCorner(board) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell fixed';
    cell.setAttribute('aria-hidden','true');
    board.appendChild(cell);
}

function initSixteen() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = 'repeat(' + (SIXTEEN_SIZE + 2) + ',1fr)';
    board.innerHTML = '';
    scrambleSixteen();

    sixteenCorner(board);
    for (let c = 0; c < SIXTEEN_SIZE; c++) {
        sixteenArrow(board,'↑',() => shiftSixteenColumn(c,-1),'Shift column ' + (c + 1) + ' up');
    }
    sixteenCorner(board);

    for (let r = 0; r < SIXTEEN_SIZE; r++) {
        sixteenArrow(board,'←',() => shiftSixteenRow(r,-1),'Shift row ' + (r + 1) + ' left');
        for (let c = 0; c < SIXTEEN_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell fixed';
            cell.id = 'sixteen-' + r + '-' + c;
            board.appendChild(cell);
        }
        sixteenArrow(board,'→',() => shiftSixteenRow(r,1),'Shift row ' + (r + 1) + ' right');
    }

    sixteenCorner(board);
    for (let c = 0; c < SIXTEEN_SIZE; c++) {
        sixteenArrow(board,'↓',() => shiftSixteenColumn(c,1),'Shift column ' + (c + 1) + ' down');
    }
    sixteenCorner(board);

    renderSixteen();
    checkSixteenWin();
}

function renderSixteen() {
    for (let r = 0; r < SIXTEEN_SIZE; r++) {
        for (let c = 0; c < SIXTEEN_SIZE; c++) {
            const cell = document.getElementById('sixteen-' + r + '-' + c);
            const value = sixteenTiles[r * SIXTEEN_SIZE + c];
            cell.innerText = value;
            cell.setAttribute(
                'aria-label',
                'Tile ' + value + ', row ' + (r + 1) + ', column ' + (c + 1)
            );
        }
    }
}

function checkSixteenWin() {
    const status = document.getElementById('arrow-status');
    if (sixteenIsSolved()) {
        status.innerText = 'All 16 tiles are in numerical order. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        const level = sixteenDifficulty();
        status.innerText = level[0].toUpperCase() + level.slice(1) + ' · shift whole rows or columns cyclically.';
        status.style.color = '';
    }
}

window.PPEngine?.register('sixteen', {
    version:1,
    serialize:() => ({ version:1, tiles:[...sixteenTiles] }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.tiles) || snapshot.tiles.length !== 16) return false;
        sixteenTiles = [...snapshot.tiles];
        renderSixteen();
        checkSixteenWin();
        return true;
    },
    validate:() => new Set(sixteenTiles).size === 16,
    isSolved:sixteenIsSolved,
    getHint:() => 'Use the edge arrows; look for a row or column that can place several tiles closer to their target positions.'
});
