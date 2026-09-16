// Routing / Net Puzzle Logic
// Based on Simon Tatham's Portable Puzzle Collection

const NET_SIZE = 4;
const PIPES = ['│', '─', '┌', '┐', '└', '┘'];
let netState = [];

function initNetGame() {
    const board = document.getElementById('net-board');
    board.style.gridTemplateColumns = `repeat(${NET_SIZE}, 1fr)`;
    board.innerHTML = '';
    netState = [];

    for (let i = 0; i < NET_SIZE * NET_SIZE; i++) {
        const rot = Math.floor(Math.random() * 4) * 90;
        netState.push(rot);

        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        // Display initial pipe character based on rotation
        const pipeChars = ['│', '─', '┌', '┐', '└', '┘'];
        const initialIdx = Math.floor(Math.random() * pipeChars.length);
        cell.innerText = pipeChars[initialIdx];
        cell.style.transform = `rotate(${rot}deg)`;

        cell.onclick = () => {
            netState[i] = (netState[i] + 90) % 360;
            cell.style.transform = `rotate(${netState[i]}deg)`;
            // Update displayed pipe based on new rotation
            updatePipeDisplay(cell, netState[i]);
        };

        // Set initial rotation display
        updatePipeDisplay(cell, rot);
        board.appendChild(cell);
    }
}

function updatePipeDisplay(cell, rotation) {
    const normalized = ((rotation % 360) + 360) % 360;
    let pipeChar;

    if (normalized === 0) pipeChar = '│';
    else if (normalized === 90) pipeChar = '─';
    else if (normalized === 180) pipeChar = '│';
    else if (normalized === 270) pipeChar = '─';
    else pipeChar = '●';

    cell.innerText = pipeChar;
}
