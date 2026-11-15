declare module 'cubejs' {
  export default class Cube {
    static initSolver(): void;
    static fromString(facelets: string): Cube;
    constructor();
    move(alg: string): void;
    asString(): string;
    isSolved(): boolean;
    solve(maxDepth?: number): string | null;
  }
}
