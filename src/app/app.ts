import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  tiles = signal<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  moves = signal<number>(0);
  seconds = signal<number>(0);
  isSolving = signal<boolean>(false);

  imageUrl = '/puzzle.jpg';

  // --- Computed Signals ---
  // Automatically updates whenever 'seconds' changes
  timerDisplay = computed(() => {
    const s = this.seconds();
    const mins = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  });

  private timerInterval: any;

  ngOnInit() {
    this.startNewGame();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startNewGame() {
    this.moves.set(0);
    this.seconds.set(0);
    this.shuffleTiles();
    this.stopTimer();
    this.startTimer();
  }

  // --- Timer Logic ---
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.seconds.update((s) => s + 1);
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // --- Shuffle & Solvability logic ---
  shuffleTiles() {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];

    // Fisher-Yates
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Ensure solvability (Inversion Parity check)
    if (!this.isSolvable(arr)) {
      const idx1 = arr[0] === 0 ? 2 : 0;
      const idx2 = arr[1] === 0 ? 2 : 1;
      [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
    }

    this.tiles.set(arr);
  }

  isSolvable(arr: number[]): boolean {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] !== 0 && arr[j] !== 0 && arr[i] > arr[j]) inversions++;
      }
    }
    return inversions % 2 === 0;
  }

  // --- Tile Movement ---
  moveTile(index: number) {
    if (this.isSolving()) return;
    const currentTiles = this.tiles();
    const emptyIndex = currentTiles.indexOf(0);

    if (this.isAdjacent(index, emptyIndex)) {
      const newTiles = [...currentTiles];
      // Swap tiles
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];

      this.tiles.set(newTiles);
      this.moves.update((m) => m + 1);

      this.checkWin();
      console.log(this.tiles());
    }
  }

  isAdjacent(idx1: number, idx2: number): boolean {
    const r1 = Math.floor(idx1 / 3),
      c1 = idx1 % 3;
    const r2 = Math.floor(idx2 / 3),
      c2 = idx2 % 3;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  }

  checkWin() {
    const winState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const hasWon = this.tiles().every((val, i) => val === winState[i]);

    if (hasWon && this.moves() > 0) {
      this.stopTimer();
      setTimeout(() => alert(`Victory! Solved in ${this.moves()} moves.`), 200);
    }
  }

  getTileStyle(tileValue: number) {
    if (tileValue === 0) return {};
    const row = Math.floor((tileValue - 1) / 3);
    const col = (tileValue - 1) % 3;
    return {
      'background-image': `url(${this.imageUrl})`,
      'background-size': '300% 300%',
      'background-position': `${col * 50}% ${row * 50}%`,
      'background-repeat': 'no-repeat',
    };
  }

  // solve with ai

  private readonly GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  private readonly SIZE = 3;

  /** Manhattan distance heuristic */
  private manhattan(state: number[]): number {
    let dist = 0;
    for (let i = 0; i < state.length; i++) {
      const val = state[i];
      if (val === 0) continue;
      const goalIdx = val - 1; // value 1 belongs at index 0, etc.
      const curRow = Math.floor(i / this.SIZE);
      const curCol = i % this.SIZE;
      const goalRow = Math.floor(goalIdx / this.SIZE);
      const goalCol = goalIdx % this.SIZE;
      dist += Math.abs(curRow - goalRow) + Math.abs(curCol - goalCol);
    }
    return dist;
  }

  /** Get neighbor states by sliding tiles into the empty slot */
  private getNeighbors(state: number[]): number[][] {
    const emptyIdx = state.indexOf(0);
    const row = Math.floor(emptyIdx / this.SIZE);
    const col = emptyIdx % this.SIZE;
    const neighbors: number[][] = [];
    const directions = [
      [-1, 0], // up
      [1, 0],  // down
      [0, -1], // left
      [0, 1],  // right
    ];

    for (const [dr, dc] of directions) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < this.SIZE && nc >= 0 && nc < this.SIZE) {
        const newIdx = nr * this.SIZE + nc;
        const newState = [...state];
        [newState[emptyIdx], newState[newIdx]] = [newState[newIdx], newState[emptyIdx]];
        neighbors.push(newState);
      }
    }
    return neighbors;
  }

  /** A* search – returns the sequence of board states from start to goal */
  private aStarSolve(start: number[]): number[][] | null {
    const goalKey = this.GOAL.join(',');

    // Min-heap implemented as a sorted insertion list (good enough for 8-puzzle)
    interface Node {
      state: number[];
      g: number;
      f: number;
      path: number[][];
    }

    const openList: Node[] = [];
    const closedSet = new Set<string>();

    const h = this.manhattan(start);
    openList.push({ state: start, g: 0, f: h, path: [start] });

    while (openList.length > 0) {
      // Pick node with lowest f
      let bestIdx = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[bestIdx].f) bestIdx = i;
      }
      const current = openList.splice(bestIdx, 1)[0];
      const key = current.state.join(',');

      if (key === goalKey) return current.path;
      if (closedSet.has(key)) continue;
      closedSet.add(key);

      for (const neighbor of this.getNeighbors(current.state)) {
        const nKey = neighbor.join(',');
        if (closedSet.has(nKey)) continue;
        const g = current.g + 1;
        const f = g + this.manhattan(neighbor);
        openList.push({ state: neighbor, g, f, path: [...current.path, neighbor] });
      }
    }

    return null; // no solution (shouldn't happen for a solvable puzzle)
  }

  /** BFS search – returns the sequence of board states from start to goal */
  private bfsSolve(start: number[]): number[][] | null {
    const goalKey = this.GOAL.join(',');
    const queue: { state: number[]; path: number[][] }[] = [{ state: start, path: [start] }];
    const visited = new Set<string>();
    visited.add(start.join(','));

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = current.state.join(',');

      if (key === goalKey) return current.path;

      for (const neighbor of this.getNeighbors(current.state)) {
        const nKey = neighbor.join(',');
        if (!visited.has(nKey)) {
          visited.add(nKey);
          queue.push({ state: neighbor, path: [...current.path, neighbor] });
        }
      }
    }
    return null;
  }

  /** Greedy Best-First Search – returns the sequence of board states */
  private greedySolve(start: number[]): number[][] | null {
    const goalKey = this.GOAL.join(',');

    interface Node {
      state: number[];
      h: number;
      path: number[][];
    }

    const openList: Node[] = [];
    const closedSet = new Set<string>();

    openList.push({ state: start, h: this.manhattan(start), path: [start] });

    while (openList.length > 0) {
      // Pick node with lowest h
      let bestIdx = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].h < openList[bestIdx].h) bestIdx = i;
      }
      const current = openList.splice(bestIdx, 1)[0];
      const key = current.state.join(',');

      if (key === goalKey) return current.path;
      if (closedSet.has(key)) continue;
      closedSet.add(key);

      for (const neighbor of this.getNeighbors(current.state)) {
        const nKey = neighbor.join(',');
        if (closedSet.has(nKey)) continue;
        openList.push({
          state: neighbor,
          h: this.manhattan(neighbor),
          path: [...current.path, neighbor],
        });
      }
    }
    return null;
  }

  /** Helper to wait a given number of ms */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Triggered by the solver buttons */
  async solveGame(algorithm: 'A*' | 'BFS' | 'Greedy'): Promise<void> {
    if (this.isSolving()) return;

    // Already solved?
    if (this.tiles().every((v, i) => v === this.GOAL[i])) return;

    this.isSolving.set(true);
    this.stopTimer();

    let solution: number[][] | null = null;

    if (algorithm === 'A*') {
      solution = this.aStarSolve(this.tiles());
    } else if (algorithm === 'BFS') {
      solution = this.bfsSolve(this.tiles());
    } else if (algorithm === 'Greedy') {
      solution = this.greedySolve(this.tiles());
    }

    if (!solution) {
      this.isSolving.set(false);
      return;
    }

    // Replay each step with a 400ms delay (skip index 0 – that's the current state)
    for (let i = 1; i < solution.length; i++) {
      await this.delay(400);
      this.tiles.set(solution[i]);
      this.moves.update((m) => m + 1);
    }

    this.isSolving.set(false);
    this.checkWin();
  }

  /** Triggered by the "SOLVE WITH AI" button */
  async solveWithAI(): Promise<void> {
    await this.solveGame('A*');
  }

  async solveWithBFS(): Promise<void> {
    await this.solveGame('BFS');
  }

  async solveWithGreedy(): Promise<void> {
    await this.solveGame('Greedy');
  }
}
