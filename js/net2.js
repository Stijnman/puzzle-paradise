// Network / NetWalk.
// A random spanning tree is rotated into a puzzle; reconnect all tiles without loops.

const NET2_N = 1;
const NET2_E = 2;
const NET2_S = 4;
const NET2_W = 8;
const NET2_DIRS = [
    [-1,0,NET2_N,NET2_S],
    [0,1,NET2_E,NET2_W],
    [1,0,NET2_S,NET2_N],
    [0,-1,NET2_W,NET2_E]
];

let net2Size = 5;
let net2Tiles = [];

function net2Difficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function net2BoardSize() {
    return { easy:4, medium:5, hard:6, expert:7 }[net2Difficulty()];
}

function generateNet2Tree() {
    const total = net2Size * net2Size;
    const masks = new Array(total).fill(0);
    const visited = new Set([Math.floor(total / 2)]);
    const frontier = [];

    function addFrontier(index) {
        const row = Math.floor(index / net2Size);
        const col = index % net2Size;

        for (const [dr,dc,bit,opposite] of NET2_DIRS) {
            const r = row + dr;
            const c = col + dc;
            if (r < 0 || r >= net2Size || c < 0 || c >= net2Size) continue;
            const next = r * net2Size + c;
            if (!visited.has(next)) frontier.push({ from:index,to:next,bit,opposite });
        }
    }

    addFrontier([...visited][0]);

    while (visited.size < total) {
        const choice = Math.floor(Math.random() * frontier.length);
        const edge = frontier.splice(choice,1)[0];
        if (visited.has(edge.to)) continue;

        masks[edge.from] |= edge.bit;
        masks[edge.to] |= edge.opposite;
        visited.add(edge.to);
        addFrontier(edge.to);
    }

    return masks;
}

function rotateNet2Mask(mask,turns = 1) {
    let result = mask;
    for (let i = 0; i < turns; i++) {
        result =
            ((result & NET2_N) ? NET2_E : 0) |
            ((result & NET2_E) ? NET2_S : 0) |
            ((result & NET2_S) ? NET2_W : 0) |
            ((result & NET2_W) ? NET2_N : 0);
    }
    return result;
}

function generateNet2() {
    const solved = generateNet2Tree();
    net2Tiles = solved.map(mask => rotateNet2Mask(mask,Math.floor(Math.random() * 4)));

    if (net2IsSolved()) net2Tiles[0] = rotateNet2Mask(net2Tiles[0],1);
}

function initNet() {
    const board = document.getElementById('arrow-board');
    net2Size = net2BoardSize();
    generateNet2();

    board.style.gridTemplateColumns = 'repeat(' + net2Size + ',1fr)';
    board.innerHTML = '';

    for (let r = 0; r < net2Size; r++) {
        for (let c = 0; c < net2Size; c++) {
            const index = r * net2Size + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'net2-' + r + '-' + c;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => rotateNet2(index);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    rotateNet2(index);
                }
            };
            board.appendChild(cell);
        }
    }

    renderNet2();
    checkNet2Win();
}

function rotateNet2(index) {
    net2Tiles[index] = rotateNet2Mask(net2Tiles[index],1);
    renderNet2();
    checkNet2Win();
}

function net2Char(mask) {
    return ({
        1:'╵',2:'╶',3:'└',4:'╷',5:'│',6:'┌',7:'├',
        8:'╴',9:'┘',10:'─',11:'┴',12:'┐',13:'┤',14:'┬',15:'┼'
    })[mask] || '·';
}

function net2ConnectedNeighbours(index) {
    const row = Math.floor(index / net2Size);
    const col = index % net2Size;
    const mask = net2Tiles[index];
    const result = [];

    for (const [dr,dc,bit,opposite] of NET2_DIRS) {
        if (!(mask & bit)) continue;
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= net2Size || c < 0 || c >= net2Size) continue;
        const next = r * net2Size + c;
        if (net2Tiles[next] & opposite) result.push(next);
    }
    return result;
}

function net2HasBoundaryLeak(index) {
    const row = Math.floor(index / net2Size);
    const col = index % net2Size;
    const mask = net2Tiles[index];
    return (
        (row === 0 && (mask & NET2_N)) ||
        (row === net2Size - 1 && (mask & NET2_S)) ||
        (col === 0 && (mask & NET2_W)) ||
        (col === net2Size - 1 && (mask & NET2_E))
    );
}

function net2IsSolved() {
    if (!net2Tiles.length || net2Tiles.some((_,index) => net2HasBoundaryLeak(index))) return false;

    const reached = new Set([0]);
    const queue = [0];

    while (queue.length) {
        const current = queue.shift();
        for (const next of net2ConnectedNeighbours(current)) {
            if (!reached.has(next)) {
                reached.add(next);
                queue.push(next);
            }
        }
    }

    return reached.size === net2Tiles.length;
}

function renderNet2() {
    for (let r = 0; r < net2Size; r++) {
        for (let c = 0; c < net2Size; c++) {
            const index = r * net2Size + c;
            const cell = document.getElementById('net2-' + r + '-' + c);
            cell.innerText = net2Char(net2Tiles[index]);
            cell.style.color = net2HasBoundaryLeak(index) ? 'var(--accent-warning)' : 'var(--primary)';
            cell.setAttribute(
                'aria-label',
                'Network tile row ' + (r + 1) + ', column ' + (c + 1)
            );
        }
    }
}

function checkNet2Win() {
    const status = document.getElementById('arrow-status');
    if (net2IsSolved()) {
        status.innerText = 'Every tile belongs to one loop-free network. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText =
            net2Difficulty()[0].toUpperCase() + net2Difficulty().slice(1) +
            ' · rotate every tile until the entire network is connected.';
        status.style.color = '';
    }
}

function net2Hint() {
    for (let index = 0; index < net2Tiles.length; index++) {
        if (net2HasBoundaryLeak(index)) {
            const row = Math.floor(index / net2Size);
            const col = index % net2Size;
            return {
                message:'This boundary tile points outside the board, so its orientation cannot be correct.',
                selector:'#net2-' + row + '-' + col
            };
        }
    }

    for (let index = 0; index < net2Tiles.length; index++) {
        const row = Math.floor(index / net2Size);
        const col = index % net2Size;
        const mask = net2Tiles[index];

        for (const [dr,dc,bit,opposite] of NET2_DIRS) {
            if (!(mask & bit)) continue;
            const r = row + dr;
            const c = col + dc;
            if (r < 0 || r >= net2Size || c < 0 || c >= net2Size) continue;
            if (!(net2Tiles[r * net2Size + c] & opposite)) {
                return {
                    message:'This pipe end is not matched by its neighbour.',
                    selector:'#net2-' + row + '-' + col
                };
            }
        }
    }

    return 'Trace connectivity outward from the centre and look for the disconnected component.';
}

window.PPEngine?.register('net2', {
    version:1,
    serialize:() => ({ version:1,size:net2Size,tiles:[...net2Tiles] }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || snapshot.size !== net2Size || !Array.isArray(snapshot.tiles)) return false;
        net2Tiles = [...snapshot.tiles];
        renderNet2();
        checkNet2Win();
        return true;
    },
    validate:() => net2Tiles.length === net2Size * net2Size,
    isSolved:net2IsSolved,
    getHint:net2Hint
});
