(() => {
  const puzzles = [
    {id:'sudoku',name:'Classic Sudoku',category:'Number',description:'Complete every row, column and 3×3 box.',icon:'▦',difficulty:2,init:'initSudoku',boardType:'sudoku',difficultyNative:true},
    {id:'arrow-escape',name:'Arrow Escape',category:'Spatial',description:'Clear arrows that point off the board.',icon:'➶',difficulty:2,init:'initArrowGame',boardType:'arrow',difficultyNative:true},
    {id:'net',name:'Pipe Routing',category:'Logic',description:'Rotate every tile until all pipes form one connected network.',icon:'⌘',difficulty:2,init:'initNetGame',boardType:'net'},
    {id:'mines',name:'Mines',category:'Logic',description:'Reveal safe cells without touching a mine.',icon:'✹',difficulty:2,init:'initMines'},
    {id:'fifteen',name:'Fifteen',category:'Spatial',description:'Slide numbered tiles into perfect order.',icon:'⑮',difficulty:2,init:'initFifteen'},
    {id:'keen',name:'Keen',category:'Number',description:'Fill a Latin square while satisfying every arithmetic cage.',icon:'⌗',difficulty:3,init:'initKeen'},
    {id:'hitori',name:'Hitori',category:'Number',description:'Shade duplicates while preserving the path.',icon:'◩',difficulty:3,init:'initHitori'},
    {id:'lightup',name:'Light Up',category:'Logic',description:'Light every open cell; bulbs cannot see each other and wall clues must match.',icon:'☀',difficulty:3,init:'initLightUp'},
    {id:'loopy',name:'Loopy',category:'Logic',description:'Draw one loop around the numbered clues.',icon:'∞',difficulty:3,init:'initLoopy'},
    {id:'bridges',name:'Bridges',category:'Logic',description:'Connect every island into one network.',icon:'≋',difficulty:3,init:'initBridges'},
    {id:'samegame',name:'Same Game',category:'Strategy',description:'Remove colour groups and clear the field.',icon:'◆',difficulty:1,init:'initSameGame'},
    {id:'untangle',name:'Untangle',category:'Spatial',description:'Swap connected points until none of the lines cross.',icon:'⌬',difficulty:2,init:'initUntangle'},
    {id:'blackbox',name:'Black Box',category:'Logic',description:'Find hidden objects by tracing rays.',icon:'◈',difficulty:4,init:'initBlackBox'},
    {id:'dominosa',name:'Dominosa',category:'Number',description:'Pair every number into a unique domino.',icon:'▥',difficulty:3,init:'initDominosa'},
    {id:'galaxies',name:'Galaxies',category:'Spatial',description:'Create rotationally symmetric regions.',icon:'✧',difficulty:3,init:'initGalaxies'},
    {id:'guess',name:'Guess',category:'Logic',description:'Crack the hidden sequence from clues.',icon:'?',difficulty:2,init:'initGuess'},
    {id:'inertia',name:'Inertia',category:'Strategy',description:'Slide through the maze and collect gems.',icon:'◉',difficulty:3,init:'initInertia'},
    {id:'ink',name:'Ink',category:'Logic',description:'Connect matching clues without crossings.',icon:'✎',difficulty:2,init:'initInk'},
    {id:'magnets',name:'Magnets',category:'Logic',description:'Place poles while satisfying every clue.',icon:'±',difficulty:4,init:'initMagnets'},
    {id:'maps',name:'Map Colouring',category:'Logic',description:'Colour every region so neighbours sharing an edge never match.',icon:'⌖',difficulty:2,init:'initMaps'},
    {id:'net2',name:'Network',category:'Logic',description:'Build a fully connected network.',icon:'⌘',difficulty:3,init:'initNet'},
    {id:'netslide',name:'Net Slide',category:'Spatial',description:'Slide tiles until every route connects.',icon:'⇄',difficulty:3,init:'initNetSlide'},
    {id:'nullgame',name:'Null Game',category:'Strategy',description:'Flip cross-shaped groups until every cell is null.',icon:'∅',difficulty:2,init:'initNullGame'},
    {id:'pattern',name:'Pattern',category:'Logic',description:'Fill cells to satisfy every row and column run-length clue.',icon:'▧',difficulty:3,init:'initPattern'},
    {id:'pearl',name:'Pearl Loop',category:'Logic',description:'Draw a loop that obeys pearl rules.',icon:'○',difficulty:4,init:'initPearl'},
    {id:'pegs',name:'Pegs',category:'Strategy',description:'Jump pegs and leave as few as possible.',icon:'♟',difficulty:2,init:'initPegs'},
    {id:'range',name:'Range',category:'Number',description:'Place values that satisfy range clues.',icon:'↔',difficulty:3,init:'initRange'},
    {id:'rect',name:'Rectangles',category:'Spatial',description:'Partition the board into rectangles.',icon:'▭',difficulty:3,init:'initRect'},
    {id:'sequencing',name:'Sequencing',category:'Number',description:'Arrange items in the right progression.',icon:'123',difficulty:2,init:'initSequence'},
    {id:'signpost',name:'Signpost',category:'Number',description:'Follow arrows to link numbers in order.',icon:'➜',difficulty:3,init:'initSignpost'},
    {id:'singles',name:'Singles',category:'Number',description:'Complete a compact Latin square.',icon:'⅙',difficulty:2,init:'initSingles'},
    {id:'sixteen',name:'Sixteen',category:'Number',description:'Fill a 4×4 grid with numbers 1–4.',icon:'16',difficulty:1,init:'initSixteen'},
    {id:'slant',name:'Slant',category:'Logic',description:'Place diagonals without forbidden loops.',icon:'╱',difficulty:3,init:'initSlant'},
    {id:'solo',name:'Solo',category:'Number',description:'Solve a clean 6×6 Latin square.',icon:'6×6',difficulty:2,init:'initSolo'},
    {id:'tents',name:'Tents',category:'Logic',description:'Match one tent to each tree, obey row/column counts, and keep tents apart.',icon:'⛺',difficulty:3,init:'initTents'},
    {id:'towers',name:'Towers',category:'Number',description:'Fill each row and column once per height while satisfying visibility clues.',icon:'▥',difficulty:3,init:'initTowers'},
    {id:'twiddle',name:'Twiddle',category:'Spatial',description:'Rotate tile groups into order.',icon:'⟳',difficulty:2,init:'initTwiddle'},
    {id:'undead',name:'Undead',category:'Logic',description:'Place ghosts, vampires and zombies to satisfy reflected sight-line clues.',icon:'☽',difficulty:3,init:'initUndead'},
    {id:'unequal',name:'Unequal',category:'Number',description:'Keep neighbouring values unequal.',icon:'≠',difficulty:2,init:'initUnequal'},
    {id:'unruly',name:'Unruly',category:'Logic',description:'Balance X and O without repetitions.',icon:'XO',difficulty:3,init:'initUnruly'},
    {id:'cube',name:'Cube',category:'Spatial',description:'Solve a cube-inspired grid challenge.',icon:'⬡',difficulty:3,init:'initCube'},
    {id:'filling',name:'Filling',category:'Number',description:'Match every region to its area.',icon:'▤',difficulty:3,init:'initFilling'},
    {id:'flip',name:'Flip',category:'Strategy',description:'Toggle cells to transform the board.',icon:'◐',difficulty:2,init:'initFlip'}
  ].map((puzzle,index) => Object.freeze({
    boardType:'arrow',
    seeded:true,
    difficultyNative:false,
    ...puzzle,
    index
  }));

  const ids = new Set();
  for (const puzzle of puzzles) {
    if (!/^[a-z0-9-]+$/.test(puzzle.id)) throw new Error(`Invalid puzzle id: ${puzzle.id}`);
    if (ids.has(puzzle.id)) throw new Error(`Duplicate puzzle id: ${puzzle.id}`);
    ids.add(puzzle.id);
  }

  const root = typeof window !== 'undefined' ? window : globalThis;
  root.PP_REGISTRY = Object.freeze(puzzles);
  root.PP_GAMES = root.PP_REGISTRY;
})();
