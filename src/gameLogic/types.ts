import type { PlayerInfo } from "@/OnlineGameDurableObject";

export const upperCategories = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
] as const;

export type UpperCategoryId = (typeof upperCategories)[number];

export function isUpperCategory(
  categoryId: string,
): categoryId is UpperCategoryId {
  return upperCategories.includes(categoryId as UpperCategoryId);
}

export const lowerCategories = [
  "kind_3",
  "kind_4",
  "full_house",
  "small_straight",
  "large_straight",
  "chance",
  "yahtzee",
] as const;

export type LowerCategoryId = (typeof lowerCategories)[number];

export function isLowerCategory(
  categoryId: string,
): categoryId is LowerCategoryId {
  return lowerCategories.includes(categoryId as LowerCategoryId);
}

export type CategoryId = UpperCategoryId | LowerCategoryId;

export type Player = {
  playerInfo: PlayerInfo;
  scoreData: PlayerScoreData;
};

export type PlayerScoreData = {
  upperSection: Partial<Record<UpperCategoryId, number>>;
  lowerSection: Partial<Record<LowerCategoryId, number>>;
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
