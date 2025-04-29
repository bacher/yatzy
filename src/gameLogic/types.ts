export const upperCategories = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
] as const;

export type UpperCategory = (typeof upperCategories)[number];

export function isUpperCategory(category: string): category is UpperCategory {
  return upperCategories.includes(category as UpperCategory);
}

export const lowerCategories = [
  "kind_3",
  "kind_4",
  "full_house",
  "small_straight",
  "large_straight",
  "chance",
  "yatzy",
] as const;

export type LowerCategory = (typeof lowerCategories)[number];

export function isLowerCategory(category: string): category is LowerCategory {
  return lowerCategories.includes(category as LowerCategory);
}

export type Player = {
  playerInfo: PlayerInfo;
  scoreData: PlayerScoreData;
};

export type PlayerInfo = {
  id: string;
  name: string;
};

export type PlayerScoreData = {
  upperSection: Partial<Record<UpperCategory, number>>;
  lowerSection: Partial<Record<LowerCategory, number>>;
  yatzyBonus: number;
};

export const diceOrdered = [1, 2, 3, 4, 5, 6] as const;

export type Dice = (typeof diceOrdered)[number];

export type DiceState = {
  diceSet: [Dice, Dice, Dice, Dice, Dice];
  keepIndexes: number[];
};

export type TotalScore = {
  upperIntermediate: number;
  upperBonus: number;
  upperTotal: number;
  lowerBonus: number;
  lowerTotal: number;
  grandTotal: number;
};

export type GameStartState = {
  state: "game_start";
  currentPlayerId: string;
  turn: number;
  diceState: DiceState | undefined;
  rollNumber: number;
};

export type GameOverState = {
  state: "game_over";
};

export type GameState = GameStartState | GameOverState;
