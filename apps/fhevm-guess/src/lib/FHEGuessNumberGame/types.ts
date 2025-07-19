export const GameStatus = {
  Active: 0, // 0
  Processing: 1, // 1
  WinAndEnded: 2, // 2
  Ended: 3, // 3
} as const;

export type GuessItem = {
  guessValue: string;
  player: string;
};
