// Light Up / Akari.
// A valid bulb placement is generated first; numbered wall clues are then revealed by difficulty.

let lightupSize=6;
let lightupWalls=new Set();
let lightupClues=new Map();
let lightupBulbs=new Set();
let lightupSolution=new Set();

function lightupDifficulty(){
    return ['easy','medium','hard','expert'].includes(window.PP_DIFFICULTY)?window.PP_DIFFICULTY:'medium';
}

function lightupSettings(){
    return {
        easy:{size:5,wall:.25,clue:1},
        medium:{size:6,wall:.21,clue:.8},
        hard:{size:7,wall:.17,clue:.58},
        expert:{size:8,wall:.14,clue:.38}
    }[lightupDifficulty()];
}

function lightUpRayCells(index,walls=lightupWalls){
    const row=Math.floor(index/lightupSize),col=index%lightupSize,cells=[];
    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
        let r=row+dr,c=col+dc;
        while(r>=0&&r<lightupSize&&c>=0&&c<lightupSize){
            const next=r*lightupSize+c;
            if(walls.has(next)) break;
            cells.push(next);
            r+=dr;c+=dc;
        }
    }
    return cells;
}

function isLightUpCellLit(index,bulbs=lightupBulbs,walls=lightupWalls){
    return bulbs.has(index)||lightUpRayCells(index,walls).some(cell=>bulbs.has(cell));
}

function adjacentLightUpBulbs(index,bulbs=lightupBulbs){
    const row=Math.floor(index/lightupSize),col=index%lightupSize;
    let count=0;
    for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){
        const r=row+dr,c=col+dc;
        if(r<0||r>=lightupSize||c<0||c>=lightupSize) continue;
        if(bulbs.has(r*lightupSize+c)) count++;
    }
    return count;
}

function generateLightUpPuzzle(){
    const settings=lightupSettings();
    lightupSize=settings.size;
    lightupWalls=new Set();

    for(let index=0;index<lightupSize*lightupSize;index++){
        if(Math.random()<settings.wall) lightupWalls.add(index);
    }

    if(lightupWalls.size<2){
        lightupWalls.add(0);
        lightupWalls.add(lightupSize*lightupSize-1);
    }

    const open=Array.from({length:lightupSize*lightupSize},(_,i)=>i).filter(i=>!lightupWalls.has(i));
    for(let i=open.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [open[i],open[j]]=[open[j],open[i]];
    }

    lightupSolution=new Set();
    for(const index of open){
        if(!isLightUpCellLit(index,lightupSolution,lightupWalls)){
            lightupSolution.add(index);
        }
    }

    lightupClues=new Map();
    for(const index of lightupWalls){
        if(Math.random()<=settings.clue){
            lightupClues.set(index,adjacentLightUpBulbs(index,lightupSolution));
        }
    }
    if(!lightupClues.size){
        const first=[...lightupWalls][0];
        lightupClues.set(first,adjacentLightUpBulbs(first,lightupSolution));
    }

    lightupBulbs=new Set();
}

function initLightUp(){
    const board=document.getElementById('arrow-board');
    generateLightUpPuzzle();
    board.style.gridTemplateColumns='repeat('+lightupSize+',1fr)';
    board.innerHTML='';

    for(let r=0;r<lightupSize;r++){
        for(let c=0;c<lightupSize;c++){
            const index=r*lightupSize+c;
            const cell=document.createElement('div');
            cell.className='grid-cell';
            cell.id='lightup-'+r+'-'+c;

            if(lightupWalls.has(index)){
                cell.classList.add('fixed');
            }else{
                cell.setAttribute('role','button');
                cell.setAttribute('tabindex','0');
                cell.onclick=()=>toggleLightUpBulb(index);
                cell.onkeydown=event=>{
                    if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleLightUpBulb(index);}
                };
            }
            board.appendChild(cell);
        }
    }

    renderLightUp();
    checkLightUpWin();
}

function lightUpBulbConflict(index){
    return lightUpRayCells(index).some(cell=>lightupBulbs.has(cell));
}

function toggleLightUpBulb(index){
    if(lightupBulbs.has(index)) lightupBulbs.delete(index);
    else lightupBulbs.add(index);
    renderLightUp();
    checkLightUpWin();
}

function renderLightUp(){
    for(let r=0;r<lightupSize;r++){
        for(let c=0;c<lightupSize;c++){
            const index=r*lightupSize+c;
            const cell=document.getElementById('lightup-'+r+'-'+c);

            if(lightupWalls.has(index)){
                const hasClue=lightupClues.has(index);
                cell.innerText=hasClue?String(lightupClues.get(index)):'■';
                cell.style.background='#101426';
                cell.style.color='#f4f6ff';
                cell.setAttribute('aria-label',hasClue?'Wall clue '+lightupClues.get(index):'Wall');
                continue;
            }

            const bulb=lightupBulbs.has(index);
            const lit=isLightUpCellLit(index);
            const conflict=bulb&&lightUpBulbConflict(index);
            cell.innerText=bulb?'☀':'';
            cell.classList.toggle('empty',!bulb);
            cell.style.background=conflict?'rgba(239,68,68,.28)':lit?'rgba(250,204,21,.22)':'rgba(8,10,24,.35)';
            cell.style.color=conflict?'#fca5a5':'#fbbf24';
            cell.setAttribute('aria-label',(bulb?'Bulb':lit?'Lit':'Unlit')+' cell row '+(r+1)+', column '+(c+1));
        }
    }
}

function lightUpSolved(){
    const white=[];
    for(let i=0;i<lightupSize*lightupSize;i++) if(!lightupWalls.has(i)) white.push(i);
    return white.every(index=>isLightUpCellLit(index)) &&
        [...lightupBulbs].every(index=>!lightUpBulbConflict(index)) &&
        [...lightupClues].every(([index,clue])=>adjacentLightUpBulbs(index)===clue);
}

function checkLightUpWin(){
    const status=document.getElementById('arrow-status');
    if(lightUpSolved()){
        status.innerText='Every square is lit and every clue is satisfied. Puzzle solved!';
        status.style.color='var(--accent-success)';
        return;
    }

    if([...lightupBulbs].some(index=>lightUpBulbConflict(index))){
        status.innerText='Two bulbs can see each other.';
        status.style.color='var(--accent-warning)';
        return;
    }

    let unlit=0;
    for(let i=0;i<lightupSize*lightupSize;i++){
        if(!lightupWalls.has(i)&&!isLightUpCellLit(i)) unlit++;
    }
    status.innerText=lightupDifficulty()[0].toUpperCase()+lightupDifficulty().slice(1)+' · '+unlit+' unlit cell'+(unlit===1?'':'s')+' remain.';
    status.style.color='';
}

function lightUpHint(){
    for(const [index,clue] of lightupClues){
        const current=adjacentLightUpBulbs(index);
        if(current>clue){
            const r=Math.floor(index/lightupSize),c=index%lightupSize;
            return {message:'This numbered wall currently has too many adjacent bulbs.',selector:'#lightup-'+r+'-'+c};
        }
    }

    for(const index of lightupSolution){
        if(!lightupBulbs.has(index)){
            const r=Math.floor(index/lightupSize),c=index%lightupSize;
            return {message:'A valid solution places a bulb in the highlighted cell.',selector:'#lightup-'+r+'-'+c};
        }
    }
    return 'Use numbered walls to eliminate impossible bulb locations.';
}

window.PPEngine?.register('lightup',{
    version:1,
    serialize:()=>({
        version:1,size:lightupSize,walls:[...lightupWalls],clues:[...lightupClues],
        bulbs:[...lightupBulbs],solution:[...lightupSolution]
    }),
    restore:s=>{
        if(!s||s.version!==1||s.size!==lightupSize) return false;
        lightupWalls=new Set(s.walls||[]);
        lightupClues=new Map(s.clues||[]);
        lightupBulbs=new Set(s.bulbs||[]);
        lightupSolution=new Set(s.solution||[]);
        renderLightUp();checkLightUpWin();return true;
    },
    validate:()=>[...lightupBulbs].every(index=>!lightUpBulbConflict(index)),
    isSolved:lightUpSolved,
    getHint:lightUpHint
});
