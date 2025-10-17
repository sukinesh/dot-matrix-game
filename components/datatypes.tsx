export interface ObjectDataType {
  [key: string]: string | number | boolean | undefined;
}

export interface GameStateType {
  ball: { x: number; y: number; vx: number; vy: number };
  paddles: number[];
  score: number[];
}


export function createGameState() {
  return {
    ball: { x: 200, y: 200, vx: 3, vy: 3 },
    paddles: [150, 150],
    score: [0, 0],
  }
}