// Guess / Mastermind-style deduction puzzle.

let guessSettings = null;
let guessSecret = [];
let guessRows = [];
let guessFeedback = [];
let guessCurrentRow = 0;
let guessFinished = false;
let guessWon = false;

const GUESS_COLOURS = [
    '#ef4444','#3b82f6','#10b981','#f59e0b',
    '#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#64748b'
];

function guessDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function getGuessSettings() {
    return {
        easy:{ colours:4, pegs:3, attempts:10, duplicates:false },
        medium:{ colours:6, pegs:4, attempts:10, duplicates:true },
        hard:{ colours:7, pegs:4, attempts:8, duplicates:true },
        expert:{ colours:8, pegs:5, attempts:8, duplicates:true }
    }[guessDifficulty()];
}

function generateGuessSecret() {
    const result = [];
    while (result.length < guessSettings.pegs) {
        const value = 1 + Math.floor(Math.random() * guessSettings.colours);
        if (guessSettings.duplicates || !result.includes(value)) result.push(value);
    }
    return result;
}

function initGuess() {
    const board = document.getElementById('arrow-board');
    guessSettings = getGuessSettings();
    guessSecret = generateGuessSecret();
    guessRows = Array.from(
        { length:guessSettings.attempts },
        () => new Array(guessSettings.pegs).fill(0)
    );
    guessFeedback = new Array(guessSettings.attempts).fill(null);
    guessCurrentRow = 0;
    guessFinished = false;
    guessWon = false;

    board.style.gridTemplateColumns = 'repeat(' + (guessSettings.pegs + 1) + ',1fr)';
    board.innerHTML = '';

    for (let row = 0; row < guessSettings.attempts; row++) {
        for (let col = 0; col < guessSettings.pegs; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell empty';
            cell.id = 'guess-' + row + '-' + col;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => cycleGuessPeg(row,col);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    cycleGuessPeg(row,col);
                }
            };
            board.appendChild(cell);
        }

        const feedback = document.createElement('div');
        feedback.className = 'grid-cell';
        feedback.id = 'guess-feedback-' + row;
        feedback.setAttribute('role','button');
        feedback.setAttribute('tabindex','0');
        feedback.onclick = () => submitGuess(row);
        feedback.onkeydown = event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                submitGuess(row);
            }
        };
        board.appendChild(feedback);
    }

    renderGuess();
    updateGuessStatus();
}

function cycleGuessPeg(row,col) {
    if (guessFinished || row !== guessCurrentRow) return;
    const current = guessRows[row][col];
    let next = (current + 1) % (guessSettings.colours + 1);

    if (!guessSettings.duplicates && next !== 0) {
        let guard = 0;
        while (guessRows[row].includes(next) && guard++ < guessSettings.colours) {
            next = (next + 1) % (guessSettings.colours + 1);
        }
    }

    guessRows[row][col] = next;
    renderGuess();
    updateGuessStatus();
}

function scoreGuess(candidate, secret = guessSecret) {
    let exact = 0;
    const secretCounts = new Map();
    const guessCounts = new Map();

    for (let i = 0; i < secret.length; i++) {
        if (candidate[i] === secret[i]) {
            exact++;
            continue;
        }
        secretCounts.set(secret[i], (secretCounts.get(secret[i]) || 0) + 1);
        guessCounts.set(candidate[i], (guessCounts.get(candidate[i]) || 0) + 1);
    }

    let colourOnly = 0;
    for (const [colour,count] of guessCounts) {
        colourOnly += Math.min(count, secretCounts.get(colour) || 0);
    }
    return { exact, colourOnly };
}

function submitGuess(row) {
    if (guessFinished || row !== guessCurrentRow) return;
    const current = guessRows[row];
    const status = document.getElementById('arrow-status');

    if (current.some(value => value === 0)) {
        status.innerText = 'Fill every peg position before submitting the guess.';
        status.style.color = 'var(--accent-warning)';
        return;
    }

    const result = scoreGuess(current);
    guessFeedback[row] = result;

    if (result.exact === guessSettings.pegs) {
        guessFinished = true;
        guessWon = true;
    } else if (row === guessSettings.attempts - 1) {
        guessFinished = true;
        guessWon = false;
    } else {
        guessCurrentRow++;
    }

    renderGuess();
    updateGuessStatus();
}

function renderGuess() {
    for (let row = 0; row < guessSettings.attempts; row++) {
        for (let col = 0; col < guessSettings.pegs; col++) {
            const cell = document.getElementById('guess-' + row + '-' + col);
            const value = guessRows[row][col];
            const active = !guessFinished && row === guessCurrentRow;

            cell.innerText = value ? String(value) : '';
            cell.style.background = value ? GUESS_COLOURS[value - 1] : 'rgba(8,10,24,.35)';
            cell.style.color = value ? '#fff' : '';
            cell.style.opacity = active || value ? '1' : '.45';
            cell.classList.toggle('empty', !value);
            cell.setAttribute(
                'aria-label',
                'Guess ' + (row + 1) + ', position ' + (col + 1) +
                ', ' + (value ? 'colour ' + value : 'empty')
            );
        }

        const feedback = document.getElementById('guess-feedback-' + row);
        const result = guessFeedback[row];
        const active = !guessFinished && row === guessCurrentRow;

        if (result) {
            feedback.innerText = '●'.repeat(result.exact) + '○'.repeat(result.colourOnly);
            feedback.setAttribute(
                'aria-label',
                result.exact + ' exact and ' + result.colourOnly + ' correct-colour wrong-position'
            );
        } else {
            feedback.innerText = active ? '✓' : '';
            feedback.setAttribute('aria-label',active ? 'Submit guess ' + (row + 1) : 'Unused feedback');
        }
        feedback.style.opacity = active || result ? '1' : '.35';
    }
}

function updateGuessStatus() {
    const status = document.getElementById('arrow-status');

    if (guessWon) {
        status.innerText = 'All pegs are correct. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
        return;
    }

    if (guessFinished) {
        status.innerText = 'No guesses remain. Solution: ' + guessSecret.join(' · ');
        status.style.color = 'var(--accent-warning)';
        return;
    }

    status.innerText =
        guessDifficulty()[0].toUpperCase() + guessDifficulty().slice(1) +
        ' · guess ' + (guessCurrentRow + 1) + '/' + guessSettings.attempts +
        ' · ● exact, ○ correct colour in the wrong place.';
    status.style.color = '';
}

function allGuessCandidates() {
    const candidates = [];
    const current = new Array(guessSettings.pegs).fill(0);

    function build(position) {
        if (position === current.length) {
            if (!guessSettings.duplicates && new Set(current).size !== current.length) return;

            for (let row = 0; row < guessCurrentRow; row++) {
                const expected = guessFeedback[row];
                if (!expected) continue;
                const scored = scoreGuess(guessRows[row],current);
                if (scored.exact !== expected.exact || scored.colourOnly !== expected.colourOnly) return;
            }

            candidates.push([...current]);
            return;
        }

        for (let colour = 1; colour <= guessSettings.colours; colour++) {
            if (!guessSettings.duplicates && current.slice(0,position).includes(colour)) continue;
            current[position] = colour;
            build(position + 1);
        }
    }

    build(0);
    return candidates;
}

function guessHint() {
    if (guessFinished) return guessWon ? 'The code is solved.' : 'Start a new puzzle for another code.';

    const candidates = allGuessCandidates();
    if (!candidates.length) return 'Your previous feedback leaves no valid candidate; review the entered guesses.';

    let bestPosition = 0;
    let bestDiversity = 0;
    let bestColours = [];

    for (let position = 0; position < guessSettings.pegs; position++) {
        const counts = new Map();
        for (const candidate of candidates) {
            counts.set(candidate[position], (counts.get(candidate[position]) || 0) + 1);
        }
        const colours = [...counts.keys()].sort((a,b)=>a-b);
        if (colours.length > bestDiversity) {
            bestDiversity = colours.length;
            bestPosition = position;
            bestColours = colours;
        }
    }

    return (
        candidates.length + ' candidate code' + (candidates.length === 1 ? '' : 's') +
        ' remain. Position ' + (bestPosition + 1) +
        ' can currently be colour ' + bestColours.join(', ') + '.'
    );
}

window.PPEngine?.register('guess', {
    version:1,
    serialize:() => ({
        version:1,
        settings:{...guessSettings},
        secret:[...guessSecret],
        rows:guessRows.map(row => [...row]),
        feedback:guessFeedback.map(item => item ? {...item} : null),
        currentRow:guessCurrentRow,
        finished:guessFinished,
        won:guessWon
    }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.secret) || !Array.isArray(snapshot.rows)) return false;
        guessSettings = {...snapshot.settings};
        guessSecret = [...snapshot.secret];
        guessRows = snapshot.rows.map(row => [...row]);
        guessFeedback = snapshot.feedback.map(item => item ? {...item} : null);
        guessCurrentRow = snapshot.currentRow;
        guessFinished = Boolean(snapshot.finished);
        guessWon = Boolean(snapshot.won);
        renderGuess();
        updateGuessStatus();
        return true;
    },
    validate:() => guessRows.every(row => row.every(value => Number.isInteger(value) && value >= 0 && value <= guessSettings.colours)),
    isSolved:() => guessWon,
    getHint:guessHint
});
