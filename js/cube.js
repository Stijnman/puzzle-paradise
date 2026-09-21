// Cube rolling-colour puzzle.
// Generated backwards from the solved state, so every position has a known solution.

const CUBE_SIZE = 4;
const CUBE_DIRS = {
    north: [-1, 0],
    south: [1, 0],
    west: [0, -1],
    east: [0, 1]
};
const CUBE_OPPOSITE = { north:'south', south:'north', west:'east', east:'west' };

let cubePosition = 0;
let cubeGround = [];
let cubeFaces = {};
let cubeSolutionMoves = [];

function cubeDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function cubeSolvedFaces() {
    return { top:true, bottom:true, north:true, south:true, east:true, west:true };
}

function cloneCubeFaces(faces) {
    return { ...faces };
}

function rollCubeFaces(direction) {
    const old = cloneCubeFaces(cubeFaces);

    if (direction === 'north') {
        cubeFaces.top = old.south;
        cubeFaces.north = old.top;
        cubeFaces.bottom = old.north;
        cubeFaces.south = old.bottom;
    } else if (direction === 'south') {
        cubeFaces.top = old.north;
        cubeFaces.south = old.top;
        cubeFaces.bottom = old.south;
        cubeFaces.north = old.bottom;
    } else if (direction === 'east') {
        cubeFaces.top = old.west;
        cubeFaces.east = old.top;
        cubeFaces.bottom = old.east;
        cubeFaces.west = old.bottom;
    } else if (direction === 'west') {
        cubeFaces.top = old.east;
        cubeFaces.west = old.top;
        cubeFaces.bottom = old.west;
        cubeFaces.east = old.bottom;
    }
}

function cubeMoveTarget(position,direction) {
    const row = Math.floor(position / CUBE_SIZE);
    const col = position % CUBE_SIZE;
    const [dr,dc] = CUBE_DIRS[direction];
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= CUBE_SIZE || c < 0 || c >= CUBE_SIZE) return -1;
    return r * CUBE_SIZE + c;
}

function applyCubeMove(direction,trackSolution = true) {
    const next = cubeMoveTarget(cubePosition,direction);
    if (next < 0) return false;

    rollCubeFaces(direction);
    const oldBottom = cubeFaces.bottom;
    cubeFaces.bottom = cubeGround[next];
    cubeGround[next] = oldBottom;
    cubePosition = next;

    if (trackSolution) {
        const expected = cubeSolutionMoves[0];
        if (expected === direction) cubeSolutionMoves.shift();
        else cubeSolutionMoves = [];
    }
    return true;
}

function applyCubeReverse(forwardDirection) {
    const [dr,dc] = CUBE_DIRS[forwardDirection];
    const row = Math.floor(cubePosition / CUBE_SIZE);
    const col = cubePosition % CUBE_SIZE;
    const previousRow = row - dr;
    const previousCol = col - dc;
    if (
        previousRow < 0 || previousRow >= CUBE_SIZE ||
        previousCol < 0 || previousCol >= CUBE_SIZE
    ) {
        return false;
    }

    const oldBottom = cubeFaces.bottom;
    cubeFaces.bottom = cubeGround[cubePosition];
    cubeGround[cubePosition] = oldBottom;
    rollCubeFaces(CUBE_OPPOSITE[forwardDirection]);
    cubePosition = previousRow * CUBE_SIZE + previousCol;
    cubeSolutionMoves.unshift(forwardDirection);
    return true;
}

function generateCube() {
    cubeGround = new Array(CUBE_SIZE * CUBE_SIZE).fill(false);
    cubeFaces = cubeSolvedFaces();
    cubePosition = 5;
    cubeSolutionMoves = [];

    const moves = { easy:12, medium:28, hard:55, expert:90 }[cubeDifficulty()];
    let previousForward = null;

    for (let i = 0; i < moves; i++) {
        const row = Math.floor(cubePosition / CUBE_SIZE);
        const col = cubePosition % CUBE_SIZE;
        const choices = Object.keys(CUBE_DIRS).filter(direction => {
            const [dr,dc] = CUBE_DIRS[direction];
            const previousRow = row - dr;
            const previousCol = col - dc;
            return (
                previousRow >= 0 && previousRow < CUBE_SIZE &&
                previousCol >= 0 && previousCol < CUBE_SIZE &&
                direction !== CUBE_OPPOSITE[previousForward]
            );
        });

        const direction = choices[Math.floor(Math.random() * choices.length)];
        applyCubeReverse(direction);
        previousForward = direction;
    }

    if (cubeIsSolved()) applyCubeReverse('east');
}

function initCube() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = 'repeat(' + CUBE_SIZE + ',1fr)';
    board.innerHTML = '';
    generateCube();

    for (let r = 0; r < CUBE_SIZE; r++) {
        for (let c = 0; c < CUBE_SIZE; c++) {
            const index = r * CUBE_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'cube-' + r + '-' + c;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => moveCubeTo(index);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    moveCubeTo(index);
                }
            };
            board.appendChild(cell);
        }
    }

    renderCube();
    checkCubeWin();
}

function moveCubeTo(target) {
    const row = Math.floor(cubePosition / CUBE_SIZE);
    const col = cubePosition % CUBE_SIZE;
    const targetRow = Math.floor(target / CUBE_SIZE);
    const targetCol = target % CUBE_SIZE;
    const dr = targetRow - row;
    const dc = targetCol - col;

    const entry = Object.entries(CUBE_DIRS)
        .find(([,delta]) => delta[0] === dr && delta[1] === dc);

    if (!entry) {
        const status = document.getElementById('arrow-status');
        status.innerText = 'Roll the cube to one orthogonally adjacent square.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    applyCubeMove(entry[0],true);
    renderCube();
    checkCubeWin();
}

function cubeBlueFaceCount() {
    return Object.values(cubeFaces).filter(Boolean).length;
}

function cubeIsSolved() {
    return cubeBlueFaceCount() === 6;
}

function renderCube() {
    for (let r = 0; r < CUBE_SIZE; r++) {
        for (let c = 0; c < CUBE_SIZE; c++) {
            const index = r * CUBE_SIZE + c;
            const cell = document.getElementById('cube-' + r + '-' + c);
            const cubeHere = index === cubePosition;
            const blue = cubeGround[index];

            cell.innerText = cubeHere ? (cubeFaces.top ? '🔷' : '⬡') : (blue ? '■' : '');
            cell.style.background = blue
                ? 'rgba(59,130,246,.32)'
                : cubeHere
                    ? 'rgba(130,153,255,.16)'
                    : 'rgba(8,10,24,.35)';
            cell.style.color = blue ? '#60a5fa' : 'var(--primary)';
            cell.setAttribute(
                'aria-label',
                (cubeHere ? 'Cube, ' : '') +
                (blue ? 'blue square, ' : '') +
                'row ' + (r + 1) + ', column ' + (c + 1)
            );
        }
    }
}

function checkCubeWin() {
    const status = document.getElementById('arrow-status');
    const faces = cubeBlueFaceCount();

    if (cubeIsSolved()) {
        status.innerText = 'All six blue marks are on the cube. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText =
            cubeDifficulty()[0].toUpperCase() + cubeDifficulty().slice(1) +
            ' · ' + faces + '/6 cube faces are blue. Roll over blue squares to transfer colour.';
        status.style.color = '';
    }
}

function cubeHint() {
    const direction = cubeSolutionMoves[0];
    if (!direction) {
        return 'Move toward a blue board square while tracking which cube face will touch it.';
    }
    const target = cubeMoveTarget(cubePosition,direction);
    const row = Math.floor(target / CUBE_SIZE);
    const col = target % CUBE_SIZE;
    return {
        message:'A known solution rolls ' + direction + ' next.',
        selector:'#cube-' + row + '-' + col
    };
}

window.PPEngine?.register('cube', {
    version:1,
    serialize:() => ({
        version:1,
        position:cubePosition,
        ground:[...cubeGround],
        faces:{...cubeFaces},
        solutionMoves:[...cubeSolutionMoves]
    }),
    restore:snapshot => {
        if (
            !snapshot ||
            snapshot.version !== 1 ||
            !Array.isArray(snapshot.ground) ||
            snapshot.ground.length !== CUBE_SIZE * CUBE_SIZE
        ) return false;

        cubePosition = snapshot.position;
        cubeGround = snapshot.ground.map(Boolean);
        cubeFaces = { ...snapshot.faces };
        cubeSolutionMoves = [...(snapshot.solutionMoves || [])];
        renderCube();
        checkCubeWin();
        return true;
    },
    validate:() => {
        const totalBlue =
            cubeGround.filter(Boolean).length +
            Object.values(cubeFaces).filter(Boolean).length;
        return totalBlue === 6 && cubePosition >= 0 && cubePosition < CUBE_SIZE * CUBE_SIZE;
    },
    isSolved:cubeIsSolved,
    getHint:cubeHint
});
