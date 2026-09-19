// Loopy / Slitherlink.
// A simply connected generated region provides a known single-loop boundary.

let loopySize=4;
let loopyEdges=new Set();
let loopyTarget=new Set();
let loopyClues=[];

function loopyDifficulty(){
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)?window.PP_DIFFICULTY:'medium';
}
function loopySettings(){
    return {
        easy:{size:3,clue:1},
        medium:{size:4,clue:.86},
        hard:{size:5,clue:.68},
        expert:{size:6,clue:.52}
    }[loopyDifficulty()];
}

function loopyVertex(row,col){ return row*(loopySize+1)+col; }
function loopyEdgeKey(a,b){ return [a,b].sort((x,y)=>x-y).join('-'); }

function loopyCellEdges(row,col){
    return [
        loopyEdgeKey(loopyVertex(row,col),loopyVertex(row,col+1)),
        loopyEdgeKey(loopyVertex(row+1,col),loopyVertex(row+1,col+1)),
        loopyEdgeKey(loopyVertex(row,col),loopyVertex(row+1,col)),
        loopyEdgeKey(loopyVertex(row,col+1),loopyVertex(row+1,col+1))
    ];
}

function buildLoopyTarget(){
    const heights=[];
    let height=1+Math.floor(Math.random()*loopySize);
    for(let col=0;col<loopySize;col++){
        if(col>0){
            height+=Math.floor(Math.random()*3)-1;
            height=Math.max(1,Math.min(loopySize,height));
        }
        heights.push(height);
    }

    const filled=new Set();
    for(let col=0;col<loopySize;col++){
        for(let row=loopySize-heights[col];row<loopySize;row++){
            filled.add(row*loopySize+col);
        }
    }

    const target=new Set();
    for(const index of filled){
        const row=Math.floor(index/loopySize),col=index%loopySize;
        const neighbours=[
            [-1,0,loopyEdgeKey(loopyVertex(row,col),loopyVertex(row,col+1))],
            [1,0,loopyEdgeKey(loopyVertex(row+1,col),loopyVertex(row+1,col+1))],
            [0,-1,loopyEdgeKey(loopyVertex(row,col),loopyVertex(row+1,col))],
            [0,1,loopyEdgeKey(loopyVertex(row,col+1),loopyVertex(row+1,col+1))]
        ];
        for(const [dr,dc,edge] of neighbours){
            const r=row+dr,c=col+dc;
            if(r<0||r>=loopySize||c<0||c>=loopySize||!filled.has(r*loopySize+c)) target.add(edge);
        }
    }
    return target;
}

function buildLoopyClues(probability){
    return Array.from({length:loopySize*loopySize},(_,index)=>{
        if(Math.random()>probability) return null;
        const row=Math.floor(index/loopySize),col=index%loopySize;
        return loopyCellEdges(row,col).filter(edge=>loopyTarget.has(edge)).length;
    });
}

function loopyVisualEdge(vr,vc){
    if(vr%2===0){
        const row=vr/2,col=(vc-1)/2;
        return loopyEdgeKey(loopyVertex(row,col),loopyVertex(row,col+1));
    }
    const row=(vr-1)/2,col=vc/2;
    return loopyEdgeKey(loopyVertex(row,col),loopyVertex(row+1,col));
}

function initLoopy(){
    const settings=loopySettings();
    loopySize=settings.size;
    loopyTarget=buildLoopyTarget();
    loopyClues=buildLoopyClues(settings.clue);
    loopyEdges=new Set();

    const board=document.getElementById('arrow-board');
    const side=loopySize*2+1;
    board.style.gridTemplateColumns='repeat('+side+',minmax(16px,1fr))';
    board.innerHTML='';

    for(let vr=0;vr<side;vr++){
        for(let vc=0;vc<side;vc++){
            const cell=document.createElement('div');
            cell.style.minWidth='16px';
            cell.style.minHeight='16px';
            cell.style.display='grid';
            cell.style.placeItems='center';

            if(vr%2===0&&vc%2===0){
                cell.innerText='•';
                cell.setAttribute('aria-hidden','true');
            }else if(vr%2===1&&vc%2===1){
                const row=(vr-1)/2,col=(vc-1)/2;
                const clue=loopyClues[row*loopySize+col];
                cell.className='grid-cell fixed';
                cell.innerText=clue===null?'':String(clue);
                cell.style.fontSize='11px';
                cell.setAttribute('aria-label',clue===null?'No clue':'Loop clue '+clue);
            }else{
                const edge=loopyVisualEdge(vr,vc);
                cell.className='grid-cell empty';
                cell.id='loopy-edge-'+vr+'-'+vc;
                cell.dataset.edge=edge;
                cell.setAttribute('role','button');
                cell.setAttribute('tabindex','0');
                cell.setAttribute('aria-label','Toggle loop edge');
                cell.onclick=()=>toggleLoopyEdge(edge);
                cell.onkeydown=event=>{
                    if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleLoopyEdge(edge);}
                };
            }
            board.appendChild(cell);
        }
    }

    renderLoopy();
    checkLoopyWin();
}

function toggleLoopyEdge(edge){
    if(loopyEdges.has(edge)) loopyEdges.delete(edge); else loopyEdges.add(edge);
    renderLoopy();
    checkLoopyWin();
}

function renderLoopy(){
    const side=loopySize*2+1;
    for(let vr=0;vr<side;vr++){
        for(let vc=0;vc<side;vc++){
            if(vr%2===vc%2) continue;
            const cell=document.getElementById('loopy-edge-'+vr+'-'+vc);
            if(!cell) continue;
            const active=loopyEdges.has(cell.dataset.edge);
            cell.innerText=active?(vr%2===0?'━':'┃'):'';
            cell.classList.toggle('empty',!active);
            cell.style.color='var(--primary)';
        }
    }
}

function loopySingleLoop(){
    if(!loopyEdges.size) return false;
    const adjacency=new Map();
    for(const edge of loopyEdges){
        const [a,b]=edge.split('-').map(Number);
        if(!adjacency.has(a)) adjacency.set(a,[]);
        if(!adjacency.has(b)) adjacency.set(b,[]);
        adjacency.get(a).push(b);adjacency.get(b).push(a);
    }
    if([...adjacency.values()].some(list=>list.length!==2)) return false;
    const start=adjacency.keys().next().value,reached=new Set([start]),queue=[start];
    while(queue.length){
        const current=queue.shift();
        for(const next of adjacency.get(current)){
            if(!reached.has(next)){reached.add(next);queue.push(next);}
        }
    }
    return reached.size===adjacency.size;
}

function loopyCluesValid(){
    return loopyClues.every((clue,index)=>{
        if(clue===null) return true;
        const row=Math.floor(index/loopySize),col=index%loopySize;
        return loopyCellEdges(row,col).filter(edge=>loopyEdges.has(edge)).length===clue;
    });
}

function loopySolved(){ return loopyCluesValid()&&loopySingleLoop(); }

function checkLoopyWin(){
    const status=document.getElementById('arrow-status');
    if(loopySolved()){
        status.innerText='Every visible clue matches and the edges form one closed loop. Puzzle solved!';
        status.style.color='var(--accent-success)';
    }else{
        status.innerText=loopyDifficulty()[0].toUpperCase()+loopyDifficulty().slice(1)+' · draw one non-branching loop matching all visible clues.';
        status.style.color='';
    }
}

function loopyHint(){
    for(const edge of loopyTarget){
        if(!loopyEdges.has(edge)){
            const cell=[...document.querySelectorAll('[data-edge]')].find(node=>node.dataset.edge===edge);
            return {
                message:'A known valid loop uses the highlighted edge.',
                selector:cell?'#'+cell.id:null
            };
        }
    }
    return 'Check numbered cells whose current edge count is already close to their clue.';
}

window.PPEngine?.register('loopy',{
    version:1,
    serialize:()=>({version:1,size:loopySize,edges:[...loopyEdges],target:[...loopyTarget],clues:[...loopyClues]}),
    restore:s=>{
        if(!s||s.version!==1||s.size!==loopySize) return false;
        loopyEdges=new Set(s.edges||[]);loopyTarget=new Set(s.target||[]);loopyClues=[...s.clues];
        renderLoopy();checkLoopyWin();return true;
    },
    validate:()=>loopyClues.every((clue,index)=>{
        if(clue===null) return true;
        const row=Math.floor(index/loopySize),col=index%loopySize;
        return loopyCellEdges(row,col).filter(edge=>loopyEdges.has(edge)).length<=clue;
    }),
    isSolved:loopySolved,
    getHint:loopyHint
});
