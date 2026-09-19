// Hitori.
// Seeded generator creates a valid target shading pattern, then derives duplicate clues from it.

let hitoriSize = 6;
let hitoriValues = [];
let hitoriShaded = new Set();
let hitoriTarget = new Set();

function hitoriDifficulty() {
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)
        ? window.PP_DIFFICULTY
        : 'medium';
}

function hitoriSettings() {
    return {
        easy:{ size:4, ratio:.14 },
        medium:{ size:5, ratio:.18 },
        hard:{ size:6, ratio:.22 },
        expert:{ size:7, ratio:.25 }
    }[hitoriDifficulty()];
}

function hitoriWhiteConnected(mask,size) {
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

function hitoriTouches(mask,index,size) {
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

function generateHitori() {
    const settings = hitoriSettings();
    hitoriSize = settings.size;
    const digits = Array.from({ length:hitoriSize }, (_,i) => i + 1);

    for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i],digits[j]] = [digits[j],digits[i]];
    }

    hitoriValues = Array.from({ length:hitoriSize * hitoriSize }, (_,index) => {
        const row = Math.floor(index / hitoriSize);
        const col = index % hitoriSize;
        return digits[(row + col) % hitoriSize];
    });

    hitoriTarget = new Set();
    const desired = Math.max(3,Math.floor(hitoriSize * hitoriSize * settings.ratio));
    const candidates = Array.from({ length:hitoriSize * hitoriSize }, (_,i) => i);
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i],candidates[j]] = [candidates[j],candidates[i]];
    }

    for (const index of candidates) {
        if (hitoriTarget.size >= desired) break;
        if (hitoriTouches(hitoriTarget,index,hitoriSize)) continue;
        const trial = new Set(hitoriTarget);
        trial.add(index);
        if (!hitoriWhiteConnected(trial,hitoriSize)) continue;
        hitoriTarget.add(index);
    }

    for (const index of hitoriTarget) {
        const row = Math.floor(index / hitoriSize);
        const col = index % hitoriSize;
        const rowChoices = Array.from({ length:hitoriSize }, (_,c) => row * hitoriSize + c)
            .filter(candidate => candidate !== index && !hitoriTarget.has(candidate));
        const colChoices = Array.from({ length:hitoriSize }, (_,r) => r * hitoriSize + col)
            .filter(candidate => candidate !== index && !hitoriTarget.has(candidate));
        const choices = rowChoices.length ? rowChoices : colChoices;
        const source = choices[Math.floor(Math.random() * choices.length)];
        hitoriValues[index] = hitoriValues[source];
    }

    hitoriShaded = new Set();
}

function initHitori() {
    const board = document.getElementById('arrow-board');
    generateHitori();
    board.style.gridTemplateColumns = 'repeat(' + hitoriSize + ',1fr)';
    board.innerHTML = '';

    for (let r = 0; r < hitoriSize; r++) {
        for (let c = 0; c < hitoriSize; c++) {
            const index = r * hitoriSize + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = 'hitori-' + r + '-' + c;
            cell.setAttribute('role','button');
            cell.setAttribute('tabindex','0');
            cell.onclick = () => toggleHitori(index);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleHitori(index);
                }
            };
            board.appendChild(cell);
        }
    }

    renderHitori();
    checkHitoriWin();
}

function toggleHitori(index) {
    if (hitoriShaded.has(index)) hitoriShaded.delete(index);
    else hitoriShaded.add(index);
    renderHitori();
    checkHitoriWin();
}

function hitoriVisibleUnique() {
    for (let r = 0; r < hitoriSize; r++) {
        const seen = new Set();
        for (let c = 0; c < hitoriSize; c++) {
            const index = r * hitoriSize + c;
            if (hitoriShaded.has(index)) continue;
            const value = hitoriValues[index];
            if (seen.has(value)) return false;
            seen.add(value);
        }
    }

    for (let c = 0; c < hitoriSize; c++) {
        const seen = new Set();
        for (let r = 0; r < hitoriSize; r++) {
            const index = r * hitoriSize + c;
            if (hitoriShaded.has(index)) continue;
            const value = hitoriValues[index];
            if (seen.has(value)) return false;
            seen.add(value);
        }
    }
    return true;
}

function hitoriShadedTouch() {
    for (const index of hitoriShaded) {
        if (hitoriTouches(new Set([...hitoriShaded].filter(item => item !== index)),index,hitoriSize)) return true;
    }
    return false;
}

function hitoriSolved() {
    return hitoriVisibleUnique() && !hitoriShadedTouch() && hitoriWhiteConnected(hitoriShaded,hitoriSize);
}

function renderHitori() {
    for (let r = 0; r < hitoriSize; r++) {
        for (let c = 0; c < hitoriSize; c++) {
            const index = r * hitoriSize + c;
            const cell = document.getElementById('hitori-' + r + '-' + c);
            const shaded = hitoriShaded.has(index);
            cell.innerText = hitoriValues[index];
            cell.style.background = shaded ? '#0f172a' : 'rgba(8,10,24,.35)';
            cell.style.color = shaded ? '#94a3b8' : 'var(--primary)';
            cell.classList.toggle('shaded',shaded);
            cell.setAttribute(
                'aria-label',
                'Number ' + hitoriValues[index] + ', row ' + (r + 1) +
                ', column ' + (c + 1) + ', ' + (shaded ? 'shaded' : 'visible')
            );
        }
    }
}

function checkHitoriWin() {
    const status = document.getElementById('arrow-status');
    const unique = hitoriVisibleUnique();
    const separate = !hitoriShadedTouch();
    const connected = hitoriWhiteConnected(hitoriShaded,hitoriSize);

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
        status.innerText = hitoriDifficulty()[0].toUpperCase() + hitoriDifficulty().slice(1) +
            ' · shade cells until visible row and column numbers are unique.';
        status.style.color = '';
    }
}

function hitoriHint() {
    for (let r = 0; r < hitoriSize; r++) {
        const positions = new Map();
        for (let c = 0; c < hitoriSize; c++) {
            const index = r * hitoriSize + c;
            if (hitoriShaded.has(index)) continue;
            const value = hitoriValues[index];
            if (!positions.has(value)) positions.set(value,[]);
            positions.get(value).push(index);
        }
        for (const [value,indices] of positions) {
            if (indices.length > 1) {
                const index = indices[0];
                return {
                    message:'Row ' + (r + 1) + ' contains duplicate ' + value + ' values; at least one must be shaded.',
                    selector:'#hitori-' + r + '-' + (index % hitoriSize)
                };
            }
        }
    }
    return 'Check columns for the next duplicate while keeping all white cells connected.';
}

window.PPEngine?.register('hitori', {
    version:1,
    serialize:() => ({
        version:1,
        size:hitoriSize,
        values:[...hitoriValues],
        shaded:[...hitoriShaded]
    }),
    restore:snapshot => {
        if (!snapshot || snapshot.version !== 1 || snapshot.size !== hitoriSize || !Array.isArray(snapshot.values)) return false;
        hitoriValues = [...snapshot.values];
        hitoriShaded = new Set(snapshot.shaded || []);
        renderHitori();
        checkHitoriWin();
        return true;
    },
    validate:() => !hitoriShadedTouch() && hitoriWhiteConnected(hitoriShaded,hitoriSize),
    isSolved:hitoriSolved,
    getHint:hitoriHint
});
