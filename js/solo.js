// Solo: 6x6 Sudoku with 2x3 blocks.
// Seeded clue removal preserves a unique solution.

const SOLO_SIZE = 6;
const SOLO_BLOCK_ROWS = 2;
const SOLO_BLOCK_COLS = 3;
let soloPuzzle = [];
let soloSolution = [];
let soloValues = [];

function soloDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function soloShuffle(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function generateSoloSolution() {
    const rowBands = soloShuffle([0,1,2]);
    const colStacks = soloShuffle([0,1]);
    const rows = rowBands.flatMap(band =>
        soloShuffle([0,1]).map(offset => band * SOLO_BLOCK_ROWS + offset)
    );
    const cols = colStacks.flatMap(stack =>
        soloShuffle([0,1,2]).map(offset => stack * SOLO_BLOCK_COLS + offset)
    );
    const digits = soloShuffle([1,2,3,4,5,6]);
    const pattern = (row,col) =>
        (row * SOLO_BLOCK_COLS + Math.floor(row / SOLO_BLOCK_ROWS) + col) % SOLO_SIZE;

    return rows.map(row => cols.map(col => digits[pattern(row,col)]));
}

function soloCandidates(values,index) {
    if (values[index]) return [];
    const row = Math.floor(index / SOLO_SIZE);
    const col = index % SOLO_SIZE;
    const used = new Set();

    for (let i = 0; i < SOLO_SIZE; i++) {
        used.add(values[row * SOLO_SIZE + i]);
        used.add(values[i * SOLO_SIZE + col]);
    }

    const blockRow = Math.floor(row / SOLO_BLOCK_ROWS) * SOLO_BLOCK_ROWS;
    const blockCol = Math.floor(col / SOLO_BLOCK_COLS) * SOLO_BLOCK_COLS;
    for (let r = blockRow; r < blockRow + SOLO_BLOCK_ROWS; r++) {
        for (let c = blockCol; c < blockCol + SOLO_BLOCK_COLS; c++) {
            used.add(values[r * SOLO_SIZE + c]);
        }
    }

    return [1,2,3,4,5,6].filter(value => !used.has(value));
}

function countSoloSolutions(puzzle,limit = 2) {
    const values = puzzle.flat();
    let count = 0;

    function solve() {
        if (count >= limit) return;
        let best = -1;
        let candidates = null;

        for (let index = 0; index < values.length; index++) {
            if (values[index]) continue;
            const next = soloCandidates(values,index);
            if (!next.length) return;
            if (!candidates || next.length < candidates.length) {
                best = index;
                candidates = next;
                if (next.length === 1) break;
            }
        }

        if (best === -1) {
            count++;
            return;
        }

        for (const value of candidates) {
            values[best] = value;
            solve();
            values[best] = 0;
            if (count >= limit) return;
        }
    }

    solve();
    return count;
}

function generateSoloPuzzle(solution) {
    const targets = { easy:24, medium:20, hard:16, expert:13 };
    const target = targets[soloDifficulty()];
    const puzzle = solution.map(row => [...row]);
    const order = soloShuffle(Array.from({ length:SOLO_SIZE * SOLO_SIZE }, (_,i) => i));
    let clues = SOLO_SIZE * SOLO_SIZE;

    for (const index of order) {
        if (clues <= target) break;
        const row = Math.floor(index / SOLO_SIZE);
        const col = index % SOLO_SIZE;
        const previous = puzzle[row][col];
        puzzle[row][col] = 0;

        if (countSoloSolutions(puzzle,2) === 1) clues--;
        else puzzle[row][col] = previous;
    }

    return puzzle;
}

function initSolo() {
    const board = document.getElementById('arrow-board');
    const status = document.getElementById('arrow-status');
    soloSolution = generateSoloSolution();
    soloPuzzle = generateSoloPuzzle(soloSolution);
    soloValues = soloPuzzle.flat();

    board.style.gridTemplateColumns = 'repeat(' + SOLO_SIZE + ',1fr)';
    board.innerHTML = '';

    for (let r = 0; r < SOLO_SIZE; r++) {
        for (let c = 0; c < SOLO_SIZE; c++) {
            const index = r * SOLO_SIZE + c;
            const fixed = soloPuzzle[r][c] !== 0;
            const cell = document.createElement('div');
            cell.className = 'grid-cell' + (fixed ? ' fixed' : ' empty');
            cell.id = 'solo-' + r + '-' + c;
            cell.style.borderTopWidth = r % SOLO_BLOCK_ROWS === 0 ? '3px' : '1px';
            cell.style.borderLeftWidth = c % SOLO_BLOCK_COLS === 0 ? '3px' : '1px';
            cell.style.borderRightWidth = c === SOLO_SIZE - 1 ? '3px' : '1px';
            cell.style.borderBottomWidth = r === SOLO_SIZE - 1 ? '3px' : '1px';

            if (!fixed) {
                cell.setAttribute('role','button');
                cell.setAttribute('tabindex','0');
                cell.onclick = () => cycleSolo(index);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        cycleSolo(index);
                    }
                };
            }
            board.appendChild(cell);
        }
    }

    renderSolo();
    const clues = soloPuzzle.flat().filter(Boolean).length;
    status.innerText = soloDifficulty()[0].toUpperCase() + soloDifficulty().slice(1) +
        ' · ' + clues + ' clues · unique solution.';
    status.style.color = '';
}

function cycleSolo(index) {
    if (soloPuzzle[Math.floor(index / SOLO_SIZE)][index % SOLO_SIZE]) return;
    soloValues[index] = (soloValues[index] + 1) % (SOLO_SIZE + 1);
    renderSolo();
    checkSoloWin();
}

function renderSolo() {
    for (let r = 0; r < SOLO_SIZE; r++) {
        for (let c = 0; c < SOLO_SIZE; c++) {
            const index = r * SOLO_SIZE + c;
            const fixed = soloPuzzle[r][c] !== 0;
            const value = soloValues[index];
            const cell = document.getElementById('solo-' + r + '-' + c);
            cell.innerText = value || '';
            cell.classList.toggle('empty', !value && !fixed);
            cell.setAttribute(
                'aria-label',
                (fixed ? 'Fixed ' : '') + (value || 'empty') +
                ', row ' + (r + 1) + ', column ' + (c + 1)
            );
        }
    }
}

function soloConflict(values = soloValues) {
    const groups = [];

    for (let i = 0; i < SOLO_SIZE; i++) {
        groups.push(values.slice(i * SOLO_SIZE,(i + 1) * SOLO_SIZE));
        groups.push(Array.from({ length:SOLO_SIZE }, (_,r) => values[r * SOLO_SIZE + i]));
    }

    for (let br = 0; br < SOLO_SIZE / SOLO_BLOCK_ROWS; br++) {
        for (let bc = 0; bc < SOLO_SIZE / SOLO_BLOCK_COLS; bc++) {
            const group = [];
            for (let r = 0; r < SOLO_BLOCK_ROWS; r++) {
                for (let c = 0; c < SOLO_BLOCK_COLS; c++) {
                    group.push(values[
                        (br * SOLO_BLOCK_ROWS + r) * SOLO_SIZE +
                        bc * SOLO_BLOCK_COLS + c
                    ]);
                }
            }
            groups.push(group);
        }
    }

    return groups.some(group => {
        const filled = group.filter(Boolean);
        return new Set(filled).size !== filled.length;
    });
}

function soloSolved() {
    return soloValues.length === SOLO_SIZE * SOLO_SIZE &&
        soloValues.every((value,index) =>
            value === soloSolution[Math.floor(index / SOLO_SIZE)][index % SOLO_SIZE]
        );
}

function checkSoloWin() {
    const status = document.getElementById('arrow-status');

    if (soloConflict()) {
        status.innerText = 'A row, column, or 2×3 block contains a duplicate.';
        status.style.color = 'var(--accent-warning)';
    } else if (soloSolved()) {
        status.innerText = '6×6 Solo solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'No conflicts detected.';
        status.style.color = '';
    }
}

function soloHint() {
    if (soloConflict()) return 'Resolve the current duplicate before continuing.';

    for (let index = 0; index < soloValues.length; index++) {
        if (soloValues[index]) continue;
        const candidates = soloCandidates(soloValues,index);
        if (candidates.length === 1) {
            const row = Math.floor(index / SOLO_SIZE);
            const col = index % SOLO_SIZE;
            return {
                message:'Row ' + (row + 1) + ', column ' + (col + 1) +
                    ' has only one candidate: ' + candidates[0] + '.',
                selector:'#solo-' + row + '-' + col
            };
        }
    }

    return 'Scan each 2×3 block for a digit that has only one legal position.';
}

window.PPEngine?.register('solo', {
    version:1,
    serialize:() => ({ version:1, values:[...soloValues] }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.values) || snapshot.values.length !== 36) return false;
        soloValues = snapshot.values.map((value,index) => {
            const fixed = soloPuzzle[Math.floor(index / SOLO_SIZE)][index % SOLO_SIZE];
            return fixed || (Number(value) >= 1 && Number(value) <= SOLO_SIZE ? Number(value) : 0);
        });
        renderSolo();
        checkSoloWin();
        return true;
    },
    validate:() => !soloConflict(),
    isSolved:soloSolved,
    getHint:soloHint,
    countSolutions:countSoloSolutions
});
