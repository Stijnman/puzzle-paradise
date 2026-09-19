// Light Up / Akari Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const LIGHTUP_SIZE = 7;
let lightupWalls = new Set();
let lightupClues = new Map();
let lightupBulbs = new Set();

function initLightUp() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${LIGHTUP_SIZE}, 1fr)`;
    board.innerHTML = '';

    const generated = generateLightUpPuzzle();
    lightupWalls = generated.walls;
    lightupClues = generated.clues;
    lightupBulbs = new Set();

    for (let r = 0; r < LIGHTUP_SIZE; r++) {
        for (let c = 0; c < LIGHTUP_SIZE; c++) {
            const idx = r * LIGHTUP_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `lightup-${r}-${c}`;

            if (!lightupWalls.has(idx)) {
                cell.setAttribute('role', 'button');
                cell.setAttribute('tabindex', '0');
                cell.onclick = () => toggleLightUpBulb(idx);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleLightUpBulb(idx);
                    }
                };
            } else {
                cell.classList.add('fixed');
            }

            board.appendChild(cell);
        }
    }

    renderLightUp();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Place bulbs so every white cell is lit, bulbs do not see each other, and wall clues match.';
    status.style.color = '';
}

function generateLightUpPuzzle() {
    const walls = new Set();
    for (let index = 0; index < LIGHTUP_SIZE * LIGHTUP_SIZE; index++) {
        if (Math.random() < 0.18) walls.add(index);
    }

    const solution = new Set();
    for (let index = 0; index < LIGHTUP_SIZE * LIGHTUP_SIZE; index++) {
        if (walls.has(index)) continue;
        if (!isLightUpCellLit(index, solution, walls)) {
            solution.add(index);
        }
    }

    const clues = new Map();
    walls.forEach(index => {
        clues.set(index, adjacentLightUpBulbs(index, solution));
    });

    return { walls, clues };
}

function lightUpRayCells(index, walls = lightupWalls) {
    const row = Math.floor(index / LIGHTUP_SIZE);
    const col = index % LIGHTUP_SIZE;
    const cells = [];

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < LIGHTUP_SIZE && c >= 0 && c < LIGHTUP_SIZE) {
            const next = r * LIGHTUP_SIZE + c;
            if (walls.has(next)) break;
            cells.push(next);
            r += dr;
            c += dc;
        }
    }
    return cells;
}

function isLightUpCellLit(index, bulbs = lightupBulbs, walls = lightupWalls) {
    if (bulbs.has(index)) return true;
    return lightUpRayCells(index, walls).some(cell => bulbs.has(cell));
}

function lightUpBulbConflict(index) {
    return lightUpRayCells(index).some(cell => lightupBulbs.has(cell));
}

function adjacentLightUpBulbs(index, bulbs = lightupBulbs) {
    const row = Math.floor(index / LIGHTUP_SIZE);
    const col = index % LIGHTUP_SIZE;
    let count = 0;

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= LIGHTUP_SIZE || c < 0 || c >= LIGHTUP_SIZE) continue;
        if (bulbs.has(r * LIGHTUP_SIZE + c)) count++;
    }
    return count;
}

function toggleLightUpBulb(index) {
    if (lightupBulbs.has(index)) lightupBulbs.delete(index);
    else lightupBulbs.add(index);
    renderLightUp();
    checkLightUpWin();
}

function renderLightUp() {
    for (let r = 0; r < LIGHTUP_SIZE; r++) {
        for (let c = 0; c < LIGHTUP_SIZE; c++) {
            const idx = r * LIGHTUP_SIZE + c;
            const cell = document.getElementById(`lightup-${r}-${c}`);

            if (lightupWalls.has(idx)) {
                const clue = lightupClues.get(idx);
                cell.innerText = String(clue);
                cell.style.background = '#101426';
                cell.style.color = '#f4f6ff';
                cell.setAttribute('aria-label', `Wall requiring ${clue} adjacent bulb${clue === 1 ? '' : 's'}`);
                continue;
            }

            const bulb = lightupBulbs.has(idx);
            const lit = isLightUpCellLit(idx);
            const conflict = bulb && lightUpBulbConflict(idx);
            cell.innerText = bulb ? '☀' : '';
            cell.classList.toggle('empty', !bulb);
            cell.style.background = conflict
                ? 'rgba(239,68,68,.28)'
                : lit
                    ? 'rgba(250,204,21,.22)'
                    : 'rgba(8,10,24,.35)';
            cell.style.color = conflict ? '#fca5a5' : '#fbbf24';
            cell.setAttribute(
                'aria-label',
                `${bulb ? 'Bulb' : lit ? 'Lit' : 'Unlit'} cell row ${r + 1}, column ${c + 1}`
            );
        }
    }
}

function checkLightUpWin() {
    const white = [];
    for (let index = 0; index < LIGHTUP_SIZE * LIGHTUP_SIZE; index++) {
        if (!lightupWalls.has(index)) white.push(index);
    }

    const allLit = white.every(index => isLightUpCellLit(index));
    const bulbsSafe = [...lightupBulbs].every(index => !lightUpBulbConflict(index));
    const cluesValid = [...lightupClues].every(([index, clue]) =>
        adjacentLightUpBulbs(index) === clue
    );

    const status = document.getElementById('arrow-status');
    if (allLit && bulbsSafe && cluesValid) {
        status.innerText = 'Every square is lit and every clue is satisfied. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (!bulbsSafe) {
        status.innerText = 'Two bulbs can see each other.';
        status.style.color = 'var(--accent-warning)';
    } else {
        const unlit = white.filter(index => !isLightUpCellLit(index)).length;
        status.innerText = `${unlit} white cell${unlit === 1 ? '' : 's'} still unlit; check numbered walls too.`;
        status.style.color = '';
    }
}
