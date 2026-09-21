// Singles / Hitori.
// Seeded generator creates a valid target shading pattern, then derives duplicate clues from it.

let singlesSize = 6;
let singlesValues = [];
let singlesShaded = new Set();
let singlesTarget = new Set();

function singlesDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function singlesSettings() {
    return {
        easy:{ size:5, ratio:.16 },
        medium:{ size:6, ratio:.20 },
        hard:{ size:7, ratio:.23 },
        expert:{ size:8, ratio:.26 }
    }[singlesDifficulty()];
}

function singlesWhiteConnected(mask,size) {
    const whites = [];
    for (let i = 0; i < size * size; i++) if (!mask.has(i)) whites.push(i);
    if (!whites.length) return false;

    const reached = new Set([whites[0]]);
    const queue = [whites[0]];
    while (queue.length) {
        const index = queue.shift();
        const row = Math.floor(index / size);
        const col = index % size;

        for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
            const next = nr * size + nc;
            if (mask.has(next) || reached.has(next)) continue;
            reached.add(next);
            queue.push(next);
        }
    }
    return reached.size === whites.length;
}

function singlesTouches(mask,index,size) {
    const row = Math.floor(index / size);
    const col = index % size;
    for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (mask.has(nr * size + nc)) return true;
    }
    return false;
}

function generateSingles() {
    const settings = singlesSettings();
    singlesSize = settings.size;
    const digits = Array.from({ length:singlesSize }, (_,i) => i + 1);

    for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i],digits[j]] = [digits[j],digits[i]];
    }

    singlesValues = Array.from({ length:singlesSize * singlesSize }, (_,index) => {
        const row = Math.floor(index / singlesSize);
        const col = index % singlesSize;
        return digits[(row + col) % singlesSize];
    });

    singlesTarget = new Set();
    const desired = Math.max(3,Math.floor(singlesSize * singlesSize * settings.ratio));
    const candidates = Array.from({ length:singlesSize * singlesSize }, (_,i) => i);
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i],candidates[j]] = [candidates[j],candidates[i]];
    }

    for (const index of candidates) {
        if (singlesTarget.size >= desired) break;
        if (singlesTouches(singlesTarget,index,singlesSize)) continue;
        const trial = new Set(singlesTarget);
        trial.add(index);
        if (!singlesWhiteConnected(trial,singlesSize)) continue;
        singlesTarget.add(index);
    }

    for (const index of singlesTarget) {
        const row = Math.floor(index / singlesSize);
        const col = index % singlesSize;
        const rowChoices = Array.from({ length:singlesSize }, (_,c) => row * singlesSize + c)
            .filter(candidate => candidate !== index && !singlesTarget.has(candidate));
        const colChoices = Array.from({ length:singlesSize }, (_,r) => r * singlesSize + col)
            .filter(candidate => candidate !== index && !singlesTarget.has(candidate));
        const choices = rowChoices.length ? rowChoices : colChoices;
        const source = choices[Math.floor(Math.random() * choices.length)];
        singlesValues[index] = singlesValues[source];
    }

    singlesShaded = new Set();
}

function initSingles() {
    const board = document.getElementById('arrow-board');
    generateSingles();
    board.style.gridTemplateColumns = 'repeat(' + singlesSize + ',1fr)';
    board.innerHTML = '';

    for (let r = 0; r < singlesSize; r++) {
        for (let c = 0; c < singlesSize; c++) {
            const index = r * singlesSize + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'singles-' + r + '-' + c;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => toggleSingles(index);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleSingles(index);
                }
            };
            board.appendChild(cell);
        }
    }

    renderSingles();
    checkSinglesWin();
}

function toggleSingles(index) {
    if (singlesShaded.has(index)) singlesShaded.delete(index);
    else singlesShaded.add(index);
    renderSingles();
    checkSinglesWin();
}

function singlesVisibleUnique() {
    for (let r = 0; r < singlesSize; r++) {
        const seen = new Set();
        for (let c = 0; c < singlesSize; c++) {
            const index = r * singlesSize + c;
            if (singlesShaded.has(index)) continue;
            const value = singlesValues[index];
            if (seen.has(value)) return false;
            seen.add(value);
        }
    }

    for (let c = 0; c < singlesSize; c++) {
        const seen = new Set();
        for (let r = 0; r < singlesSize; r++) {
            const index = r * singlesSize + c;
            if (singlesShaded.has(index)) continue;
            const value = singlesValues[index];
            if (seen.has(value)) return false;
            seen.add(value);
        }
    }
    return true;
}

function singlesShadedTouch() {
    for (const index of singlesShaded) {
        if (singlesTouches(new Set([...singlesShaded].filter(item => item !== index)),index,singlesSize)) return true;
    }
    return false;
}

function singlesSolved() {
    return singlesVisibleUnique() && !singlesShadedTouch() && singlesWhiteConnected(singlesShaded,singlesSize);
}

function renderSingles() {
    for (let r = 0; r < singlesSize; r++) {
        for (let c = 0; c < singlesSize; c++) {
            const index = r * singlesSize + c;
            const cell = document.getElementById('singles-' + r + '-' + c);
            const shaded = singlesShaded.has(index);
            cell.innerText = singlesValues[index];
            cell.style.background = shaded ? '#0f172a' : 'rgba(8,10,24,.35)';
            cell.style.color = shaded ? '#94a3b8' : 'var(--primary)';
            cell.classList.toggle('shaded',shaded);
            cell.setAttribute(
                'aria-label',
                'Number ' + singlesValues[index] + ', row ' + (r + 1) +
                ', column ' + (c + 1) + ', ' + (shaded ? 'shaded' : 'visible')
            );
        }
    }
}

function checkSinglesWin() {
    const status = document.getElementById('arrow-status');
    const unique = singlesVisibleUnique();
    const separate = !singlesShadedTouch();
    const connected = singlesWhiteConnected(singlesShaded,singlesSize);

    if (unique && separate && connected) {
        status.innerText = 'Duplicates removed, shaded cells separated, whites connected. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else if (!separate) {
        status.innerText = 'Shaded cells may not touch along an edge.';
        status.style.color = 'var(--accent-warning)';
    } else if (!connected) {
        status.innerText = 'The remaining white cells must stay connected.';
        status.style.color = 'var(--accent-warning)';
    } else {
        status.innerText = singlesDifficulty()[0].toUpperCase() + singlesDifficulty().slice(1) +
            ' · shade cells until visible row and column numbers are unique.';
        status.style.color = '';
    }
}

function singlesHint() {
    for (let r = 0; r < singlesSize; r++) {
        const positions = new Map();
        for (let c = 0; c < singlesSize; c++) {
            const index = r * singlesSize + c;
            if (singlesShaded.has(index)) continue;
            const value = singlesValues[index];
            if (!positions.has(value)) positions.set(value,[]);
            positions.get(value).push(index);
        }
        for (const [value,indices] of positions) {
            if (indices.length > 1) {
                const index = indices[0];
                return {
                    message:'Row ' + (r + 1) + ' contains duplicate ' + value + ' values; at least one must be shaded.',
                    selector:'#singles-' + r + '-' + (index % singlesSize)
                };
            }
        }
    }
    return 'Check columns for the next duplicate while keeping all white cells connected.';
}

window.PPEngine?.register('singles', {
    version:1,
    serialize:() => ({
        version:1,
        size:singlesSize,
        values:[...singlesValues],
        shaded:[...singlesShaded]
    }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || snapshot.size !== singlesSize || !Array.isArray(snapshot.values)) return false;
        singlesValues = [...snapshot.values];
        singlesShaded = new Set(snapshot.shaded || []);
        renderSingles();
        checkSinglesWin();
        return true;
    },
    validate:() => !singlesShadedTouch() && singlesWhiteConnected(singlesShaded,singlesSize),
    isSolved:singlesSolved,
    getHint:singlesHint
});
