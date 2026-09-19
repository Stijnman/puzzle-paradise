// Pipe Routing / Net Puzzle Logic.
// Random spanning-tree generation guarantees a connected loop-free solution.

const NET_N=1, NET_E=2, NET_S=4, NET_W=8;
const NET_DIRS=[[-1,0,NET_N,NET_S],[0,1,NET_E,NET_W],[1,0,NET_S,NET_N],[0,-1,NET_W,NET_E]];
let netSize=4;
let netState=[];

function netDifficulty(){
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)?window.PP_DIFFICULTY:'medium';
}
function netBoardSize(){ return {easy:3,medium:4,hard:5,expert:6}[netDifficulty()]; }

function initNetGame(){
    const board=document.getElementById('net-board');
    const status=document.getElementById('net-status');
    netSize=netBoardSize();
    board.style.gridTemplateColumns='repeat('+netSize+',1fr)';
    board.innerHTML='';

    const solved=generateNetTree();
    netState=solved.map(mask=>rotateNetMask(mask,Math.floor(Math.random()*4)));
    if(isNetSolved()) netState[0]=rotateNetMask(netState[0],1);

    netState.forEach((_,index)=>{
        const cell=document.createElement('div');
        cell.className='grid-cell';
        cell.id='net-'+index;
        cell.setAttribute('role','button');
        cell.setAttribute('tabindex','0');
        cell.onclick=()=>rotateNetCell(index);
        cell.onkeydown=event=>{
            if(event.key==='Enter'||event.key===' '){event.preventDefault();rotateNetCell(index);}
        };
        board.appendChild(cell);
    });

    renderNetBoard();
    status.innerText=netDifficulty()[0].toUpperCase()+netDifficulty().slice(1)+' · connect all '+(netSize*netSize)+' pipe tiles.';
    status.style.color='';
}

function generateNetTree(){
    const masks=new Array(netSize*netSize).fill(0);
    const start=Math.floor(masks.length/2);
    const visited=new Set([start]);
    const frontier=[];

    function addFrontier(index){
        const row=Math.floor(index/netSize),col=index%netSize;
        for(const [dr,dc,bit,opposite] of NET_DIRS){
            const r=row+dr,c=col+dc;
            if(r<0||r>=netSize||c<0||c>=netSize) continue;
            const next=r*netSize+c;
            if(!visited.has(next)) frontier.push({from:index,to:next,bit,opposite});
        }
    }

    addFrontier(start);
    while(visited.size<masks.length){
        const pick=Math.floor(Math.random()*frontier.length);
        const edge=frontier.splice(pick,1)[0];
        if(visited.has(edge.to)) continue;
        masks[edge.from]|=edge.bit;
        masks[edge.to]|=edge.opposite;
        visited.add(edge.to);
        addFrontier(edge.to);
    }
    return masks;
}

function rotateNetMask(mask,turns=1){
    let result=mask;
    for(let i=0;i<turns;i++){
        result=((result&NET_N)?NET_E:0)|((result&NET_E)?NET_S:0)|((result&NET_S)?NET_W:0)|((result&NET_W)?NET_N:0);
    }
    return result;
}

function rotateNetCell(index){
    netState[index]=rotateNetMask(netState[index],1);
    renderNetBoard();
    checkNetGameWin();
}

function netPipeCharacter(mask){
    return ({1:'╵',2:'╶',3:'└',4:'╷',5:'│',6:'┌',7:'├',8:'╴',9:'┘',10:'─',11:'┴',12:'┐',13:'┤',14:'┬',15:'┼'})[mask]||'·';
}

function renderNetBoard(){
    netState.forEach((mask,index)=>{
        const cell=document.getElementById('net-'+index);
        if(!cell) return;
        cell.innerText=netPipeCharacter(mask);
        cell.setAttribute('aria-label','Pipe tile row '+(Math.floor(index/netSize)+1)+', column '+(index%netSize+1));
    });
}

function connectedNetNeighbours(index){
    const row=Math.floor(index/netSize),col=index%netSize,mask=netState[index],result=[];
    for(const [dr,dc,bit,opposite] of NET_DIRS){
        if(!(mask&bit)) continue;
        const r=row+dr,c=col+dc;
        if(r<0||r>=netSize||c<0||c>=netSize) continue;
        const next=r*netSize+c;
        if(netState[next]&opposite) result.push(next);
    }
    return result;
}

function netBoundaryLeak(index){
    const row=Math.floor(index/netSize),col=index%netSize,mask=netState[index];
    return (row===0&&(mask&NET_N))||(row===netSize-1&&(mask&NET_S))||(col===0&&(mask&NET_W))||(col===netSize-1&&(mask&NET_E));
}

function isNetSolved(){
    if(!netState.length||netState.some((_,index)=>netBoundaryLeak(index))) return false;
    const reached=new Set([0]),queue=[0];
    while(queue.length){
        const current=queue.shift();
        for(const next of connectedNetNeighbours(current)){
            if(!reached.has(next)){reached.add(next);queue.push(next);}
        }
    }
    return reached.size===netState.length;
}

function checkNetGameWin(){
    const status=document.getElementById('net-status');
    if(isNetSolved()){
        status.innerText='Network connected. Puzzle solved!';
        status.style.color='var(--accent-success)';
    }else{
        status.innerText='Keep rotating: every tile must belong to one connected network.';
        status.style.color='';
    }
}

function netHint(){
    for(let index=0;index<netState.length;index++){
        if(netBoundaryLeak(index)){
            return {message:'A boundary tile points outside the board.',selector:'#net-'+index};
        }
    }
    return 'Trace the connected component from the centre and inspect its exposed pipe ends.';
}

window.PPEngine?.register('net',{
    version:1,
    serialize:()=>({version:1,size:netSize,state:[...netState]}),
    restore:s=>{
        if(!s||s.version!==1||s.size!==netSize||!Array.isArray(s.state)) return false;
        netState=[...s.state];renderNetBoard();checkNetGameWin();return true;
    },
    validate:()=>netState.length===netSize*netSize,
    isSolved:isNetSolved,
    getHint:netHint
});
