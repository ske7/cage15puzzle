import { defineStore, acceptHMRUpdate } from 'pinia';
import { generateAndShuffle, generate, isSolvable } from '../utils';

type puzzleCores = 3 | 4 | 5;

const CORE_NUM: puzzleCores = 4;

export const SPACE_BETWEEN_SQUARES = 8;

export const enum Direction {
  None = 0,
  Up = 1,
  Right = 2,
  Down = 3,
  Left = 4
}

export const useBaseStore = defineStore('base', {
  state: () => ({
    numLines: CORE_NUM,
    freeElement: 0,
    time: 0,
    movesCount: 0,
    afterDoneCount: 0,
    actualOrders: [] as number[],
    mixedOrders: [] as number[],
    doResetList: false,
    interval: 0,
    paused: false,
    movesRecord: 0,
    timeRecord: 0,
    doneFirstMove: false,
    showConfirm: false,
    showSquareNum: false
  }),
  actions: {
    initStore() {
      this.numLines = CORE_NUM;
      this.freeElement = 0;
      this.time = 0;
      this.movesCount = 0;
      this.afterDoneCount = 0;
      this.actualOrders = generate(this.arrayLength);
      this.mixedOrders = generateAndShuffle(this.arrayLength);
      let solvable = isSolvable(this.mixedOrders);
      while (!solvable) {
        this.mixedOrders = generateAndShuffle(this.arrayLength);
        solvable = isSolvable(this.mixedOrders);
      }
      this.freeElement = this.actualOrders[this.mixedOrders.findIndex((x) => x === 0)];
      this.actualOrders[this.mixedOrders.findIndex((x) => x === 0)] = -1;
      this.doResetList = false;
      this.doneFirstMove = false;
    },
    incMoves() {
      this.movesCount++;
    },
    reset() {
      this.doResetList = true;
    },
    stopInterval() {
      clearInterval(this.interval);
    },
    restartInterval() {
      if (this.interval) {
        this.stopInterval();
      }
      this.interval = setInterval(() => {
        if (this.paused || !this.doneFirstMove) {
          return;
        }
        this.time++;
      }, 1000);
    },
    invertPaused() {
      if (this.showConfirm) {
        return;
      }
      this.paused = !this.paused;
    },
    saveActualOrder(order: number, moveDirection: Direction) {
      if (!this.doneFirstMove) {
        this.doneFirstMove = true;
      }
      const prevOrder = this.actualOrders[order];
      switch (moveDirection) {
        case Direction.Right:
          this.actualOrders[order] = prevOrder + 1;
          break;
        case Direction.Left:
          this.actualOrders[order] = prevOrder - 1;
          break;
        case Direction.Down:
          this.actualOrders[order] = prevOrder + this.numLines;
          break;
        case Direction.Up:
          this.actualOrders[order] = prevOrder - this.numLines;
          break;
        default:
      }
      this.incMoves();
      this.freeElement = prevOrder;
    },
    boardSize(squareSize: number) {
      return `${this.numLines * squareSize + SPACE_BETWEEN_SQUARES * (this.numLines + 1)}px`;
    }
  },
  getters: {
    arrayLength(): number {
      return this.numLines ** 2;
    },
    orderedCount(): number {
      let count = 0;
      for (const i in this.actualOrders) {
        if (
          this.actualOrders[i] !== -1 &&
          this.actualOrders[i] + 1 === this.mixedOrders[i]
        ) {
          count += 1;
        }
      }
      return count;
    },
    isDone(): boolean {
      return this.orderedCount === this.arrayLength - 1;
    },
    afterDoneAnimationEnd(): boolean {
      if (!this.isDone) {
        return true;
      }
      return this.afterDoneCount === this.arrayLength - 1;
    },
    minutes(): number {
      return Math.floor(this.time / 60);
    },
    seconds(): string {
      return (this.time % 60).toString().padStart(2, '0');
    },
    timeRecordMinutes(): number {
      return Math.floor(this.timeRecord / 60);
    },
    timeRecordSeconds(): string {
      return (this.timeRecord % 60).toString().padStart(2, '0');
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBaseStore, import.meta.hot));
}
