export interface GameState {
  poles: number[][];
  moves: number;
  isComplete: boolean;
}

export function createInitialState(diskCount: number): GameState {
  const leftPole = [];
  for (let i = diskCount; i >= 1; i--) {
    leftPole.push(i);
  }
  
  return {
    poles: [leftPole, [], []],
    moves: 0,
    isComplete: false
  };
}

export function isValidMove(state: GameState, fromPole: number, toPole: number): boolean {
  if (fromPole === toPole) return false;
  if (state.poles[fromPole].length === 0) return false;
  
  const fromDisk = state.poles[fromPole][state.poles[fromPole].length - 1];
  const toPole_disks = state.poles[toPole];
  
  if (toPole_disks.length === 0) return true;
  
  const toDisk = toPole_disks[toPole_disks.length - 1];
  return fromDisk < toDisk;
}

export function makeMove(state: GameState, fromPole: number, toPole: number): GameState {
  if (!isValidMove(state, fromPole, toPole)) {
    return state;
  }
  
  const newPoles = state.poles.map(pole => [...pole]);
  const disk = newPoles[fromPole].pop();
  
  if (disk !== undefined) {
    newPoles[toPole].push(disk);
  }
  
  const totalDisks = state.poles[0].length + state.poles[1].length + state.poles[2].length;
  const isComplete = newPoles[2].length === totalDisks;
  
  return {
    poles: newPoles,
    moves: state.moves + 1,
    isComplete
  };
}

export function getOptimalMoves(diskCount: number): number {
  return Math.pow(2, diskCount) - 1;
}

export function checkWinCondition(state: GameState, totalDisks: number): boolean {
  return state.poles[2].length === totalDisks;
}
