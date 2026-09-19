// Unequal / Futoshiki Puzzle Logic
// Puzzle concept inspired by Simon Tatham's Portable Puzzle Collection.

const UNEQUAL_SIZE = 5;
let unequalSolution = [];
let unequalValues = [];
let unequalFixed = new Set();
let unequalRelations = [];

function generateUnequalSolution() {
    const digits = [1,2,3,4,5];
    for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i],digits[j]] = [digits[j],digits[i]];
    }
    return Array.from({ length: UNEQUAL_SIZE }, (_, row) =>
        Array.from({ length: UNEQUAL_SIZE }, (_, col) => digits[(row + col) % UNEQUAL_SIZE])
    );
}

function initUnequal() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${UNEQUAL_SIZE},1fr)`;
    board.innerHTML = '';

    unequalSolution = generateUnequalSolution();
    unequalValues = new Array(UNEQUAL_SIZE * UNEQUAL_SIZE).fill(0);
    unequalFixed = new Set([0,4,6,12,18,20,24]);
    unequalRelations = [];

    for (let r = 0; r < UNEQUAL_SIZE; r++) {
        for (let c = 0; c < UNEQUAL_SIZE; c++) {
            const idx = r * UNEQUAL_SIZE + c;
            if (unequalFixed.has(idx)) unequalValues[idx] = unequalSolution[r][c];

            if (c + 1 < UNEQUAL_SIZE && (r + c) % 2 === 0) {
                const other = idx + 1;
                unequalRelations.push({
                    a: idx, b: other,
                    sign: unequalSolution[r][c] < unequalSolution[r][c + 1] ? '<' : '>'
                });
            }
            if (r + 1 < UNEQUAL_SIZE && (r + c) % 3 === 0) {
                const other = idx + UNEQUAL_SIZE;
                unequalRelations.push({
                    a: idx, b: other,
                    sign: unequalSolution[r][c] < unequalSolution[r + 1][c] ? '<' : '>'
                });
            }
        }
    }

    for (let r = 0; r < UNEQUAL_SIZE; r++) {
        for (let c = 0; c < UNEQUAL_SIZE; c++) {
            const idx = r * UNEQUAL_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell' + (unequalFixed.has(idx) ? ' fixed' : ' empty');
            cell.id = `unequal-${r}-${c}`;
            cell.style.position = 'relative';

            const value = document.createElement('span');
            value.id = `unequal-value-${r}-${c}`;
            cell.appendChild(value);

            const right = unequalRelations.find(rel => rel.a === idx && rel.b === idx + 1);
            if (right) {
                const clue = document.createElement('span');
                clue.innerText = right.sign;
                clue.style.position = 'absolute';
                clue.style.right = '-8px';
                clue.style.zIndex = '3';
                clue.style.fontSize = '10px';
                clue.setAttribute('aria-hidden','true');
                cell.appendChild(clue);
            }

            const down = unequalRelations.find(rel => rel.a === idx && rel.b === idx + UNEQUAL_SIZE);
            if (down) {
                const clue = document.createElement('span');
                clue.innerText = down.sign === '<' ? '⌄' : '⌃';
                clue.style.position = 'absolute';
                clue.style.bottom = '-9px';
                clue.style.zIndex = '3';
                clue.style.fontSize = '10px';
                clue.setAttribute('aria-hidden','true');
                cell.appendChild(clue);
            }

            if (!unequalFixed.has(idx)) {
                cell.setAttribute('role','button');
                cell.setAttribute('tabindex','0');
                cell.onclick = () => cycleUnequal(idx);
                cell.onkeydown = event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        cycleUnequal(idx);
                    }
                };
            }
            board.appendChild(cell);
        }
    }

    renderUnequal();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Fill 1–5 once per row and column and satisfy every inequality sign.';
    status.style.color = '';
}

function cycleUnequal(index) {
    unequalValues[index] = (unequalValues[index] + 1) % (UNEQUAL_SIZE + 1);
    renderUnequal();
    checkUnequalWin();
}

function renderUnequal() {
    for (let r = 0; r < UNEQUAL_SIZE; r++) {
        for (let c = 0; c < UNEQUAL_SIZE; c++) {
            const idx = r * UNEQUAL_SIZE + c;
            const cell = document.getElementById(`unequal-${r}-${c}`);
            const value = document.getElementById(`unequal-value-${r}-${c}`);
            value.innerText = unequalValues[idx] || '';
            cell.classList.toggle('empty', !unequalValues[idx] && !unequalFixed.has(idx));
            cell.setAttribute('aria-label', `${unequalFixed.has(idx) ? 'Fixed ' : ''}${unequalValues[idx] || 'empty'}, row ${r + 1}, column ${c + 1}`);
        }
    }
}

function checkUnequalWin() {
    const status = document.getElementById('arrow-status');
    if (unequalValues.some(value => value === 0)) {
        status.innerText = 'Complete every cell while respecting the inequality signs.';
        status.style.color = '';
        return;
    }

    const rows = Array.from({ length: UNEQUAL_SIZE }, (_, row) =>
        unequalValues.slice(row * UNEQUAL_SIZE, (row + 1) * UNEQUAL_SIZE)
    );
    const cols = Array.from({ length: UNEQUAL_SIZE }, (_, col) => rows.map(row => row[col]));
    const latin = [...rows,...cols].every(line => new Set(line).size === UNEQUAL_SIZE);
    const relations = unequalRelations.every(rel =>
        rel.sign === '<' ? unequalValues[rel.a] < unequalValues[rel.b] : unequalValues[rel.a] > unequalValues[rel.b]
    );

    if (latin && relations) {
        status.innerText = 'Latin-square and inequality rules all satisfied. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        status.innerText = 'Check repeated numbers and inequality signs.';
        status.style.color = 'var(--accent-warning)';
    }
}
