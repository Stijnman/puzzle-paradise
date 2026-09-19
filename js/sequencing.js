// Sequencing Puzzle Logic
// Original Puzzle Paradise ordering puzzle.

const SEQUENCE_SIZE = 5;
let sequenceValues = [];
let sequenceSelected = null;

function initSequence() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${SEQUENCE_SIZE}, 1fr)`;
    board.innerHTML = '';

    sequenceValues = Array.from(
        { length: SEQUENCE_SIZE * SEQUENCE_SIZE },
        (_, index) => index + 1
    );

    do {
        for (let i = sequenceValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequenceValues[i], sequenceValues[j]] = [sequenceValues[j], sequenceValues[i]];
        }
    } while (sequenceSolved());

    sequenceSelected = null;

    for (let r = 0; r < SEQUENCE_SIZE; r++) {
        for (let c = 0; c < SEQUENCE_SIZE; c++) {
            const idx = r * SEQUENCE_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `sequence-${r}-${c}`;
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.onclick = () => selectSequenceCell(idx);
            cell.onkeydown = event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectSequenceCell(idx);
                }
            };
            board.appendChild(cell);
        }
    }

    renderSequence();
    const status = document.getElementById('arrow-status');
    status.innerText = 'Select two tiles to swap them. Arrange 1–25 in reading order from top-left to bottom-right.';
    status.style.color = '';
}

function selectSequenceCell(index) {
    if (sequenceSelected === null) {
        sequenceSelected = index;
        renderSequence();
        return;
    }

    if (sequenceSelected === index) {
        sequenceSelected = null;
        renderSequence();
        return;
    }

    [sequenceValues[sequenceSelected], sequenceValues[index]] =
        [sequenceValues[index], sequenceValues[sequenceSelected]];
    sequenceSelected = null;
    renderSequence();
    checkSequenceWin();
}

function sequenceSolved() {
    return sequenceValues.every((value, index) => value === index + 1);
}

function renderSequence() {
    sequenceValues.forEach((value, index) => {
        const row = Math.floor(index / SEQUENCE_SIZE);
        const col = index % SEQUENCE_SIZE;
        const cell = document.getElementById(`sequence-${row}-${col}`);
        if (!cell) return;

        cell.innerText = value;
        cell.style.background = index === sequenceSelected
            ? 'rgba(34,197,94,.24)'
            : 'rgba(8,10,24,.35)';
        cell.style.color = value === index + 1 ? 'var(--accent-success)' : 'var(--primary)';
        cell.setAttribute(
            'aria-label',
            `Tile ${value} at position ${index + 1}${index === sequenceSelected ? ', selected' : ''}`
        );
    });
}

function checkSequenceWin() {
    const status = document.getElementById('arrow-status');
    if (sequenceSolved()) {
        status.innerText = 'All 25 tiles are in sequence. Puzzle solved!';
        status.style.color = 'var(--accent-success)';
    } else {
        const correct = sequenceValues.filter((value, index) => value === index + 1).length;
        status.innerText = `${correct}/${sequenceValues.length} tiles are in their correct positions.`;
        status.style.color = '';
    }
}
