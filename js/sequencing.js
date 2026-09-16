// Sequencing / Strands Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const BOARD_SIZE = 6;
let strands = [];

function initSequence() {
    const board = document.getElementById('arrow-board');
    board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
    board.innerHTML = '';
    document.getElementById('arrow-status').innerText = '';
    strands = new Array(BOARD_SIZE * BOARD_SIZE).fill(0);

    // Create strands of connected cells
    // Each strand has a sequence number

    // Simplified: place sequence numbers 1-6
    const seqNumbers = [1, 2, 3, 4, 5, 6];
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        strands[i] = seqNumbers[i % seqNumbers.length];
    }

    // Create cells
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const idx = r * BOARD_SIZE + c;
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `sequence-${r}-${c}`;

            if (strands[idx] > 0) {
                cell.innerText = strands[idx];
                cell.style.color = getSequenceColor(strands[idx]);
                cell.style.fontWeight = 'bold';
                cell.style.fontSize = '16px';
            } else {
                cell.innerText = '';
                cell.classList.add('empty');
            }

            cell.onclick = () => {
                // Toggle sequence number
                if (strands[idx]) {
                    strands[idx] = 0;
                    cell.innerText = '';
                } else {
                    strands[idx] = 1;
                    cell.innerText = '1';
                    cell.style.color = '#2563eb';
                    cell.style.fontWeight = 'bold';
                }
                checkSequenceWin();
            };

            board.appendChild(cell);
        }
    }

    checkSequenceWin();
}

function getSequenceColor(num) {
    const colors = ['#2563eb', '#1e40af', '#3b82f6', '#6366f1', '#8b5cf6'];
    return colors[num - 1] || '#6366f1';
}

function checkSequenceWin() {
    const status = document.getElementById('arrow-status');
    let filled = strands.filter(s => s > 0).length;
    if (filled > 0) {
        status.innerText = 'Sequencing...';
        status.style.color = 'var(--accent-warning)';
    }
}
