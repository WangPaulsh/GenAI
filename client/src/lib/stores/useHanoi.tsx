import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface SelectedDisk {
  pole: number;
  diskIndex: number;
}

interface HanoiState {
  poles: number[][];
  moves: number;
  isComplete: boolean;
  selectedDisk: SelectedDisk | null;
  totalDisks: number;
  
  // Actions
  initializeGame: (diskCount: number) => void;
  resetGame: () => void;
  selectDisk: (pole: number | null, diskIndex: number) => void;
  moveDisk: (fromPole: number, toPole: number) => void;
  isValidMove: (fromPole: number, toPole: number) => boolean;
  getOptimalMoves: () => number;
}

export const useHanoi = create<HanoiState>()(
  subscribeWithSelector((set, get) => ({
    poles: [[], [], []],
    moves: 0,
    isComplete: false,
    selectedDisk: null,
    totalDisks: 3,

    initializeGame: (diskCount: number) => {
      const initialPole = [];
      for (let i = diskCount; i >= 1; i--) {
        initialPole.push(i);
      }
      
      set({
        poles: [initialPole, [], []],
        moves: 0,
        isComplete: false,
        selectedDisk: null,
        totalDisks: diskCount
      });
    },

    resetGame: () => {
      const { totalDisks } = get();
      get().initializeGame(totalDisks);
    },

    selectDisk: (pole: number | null, diskIndex: number) => {
      if (pole === null) {
        set({ selectedDisk: null });
      } else {
        set({ selectedDisk: { pole, diskIndex } });
      }
    },

    moveDisk: (fromPole: number, toPole: number) => {
      const { poles, moves, totalDisks } = get();
      
      if (!get().isValidMove(fromPole, toPole)) {
        return;
      }

      const newPoles = poles.map(pole => [...pole]);
      const disk = newPoles[fromPole].pop();
      
      if (disk !== undefined) {
        newPoles[toPole].push(disk);
        
        const newMoves = moves + 1;
        const isComplete = newPoles[2].length === totalDisks;
        
        set({
          poles: newPoles,
          moves: newMoves,
          isComplete,
          selectedDisk: null
        });
      }
    },

    isValidMove: (fromPole: number, toPole: number) => {
      const { poles } = get();
      
      if (fromPole === toPole) return false;
      if (poles[fromPole].length === 0) return false;
      
      const fromDisk = poles[fromPole][poles[fromPole].length - 1];
      const toDisk = poles[toPole].length > 0 ? poles[toPole][poles[toPole].length - 1] : Infinity;
      
      return fromDisk < toDisk;
    },

    getOptimalMoves: () => {
      const { totalDisks } = get();
      return Math.pow(2, totalDisks) - 1;
    }
  }))
);
