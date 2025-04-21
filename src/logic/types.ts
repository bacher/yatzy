export const upperSections = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
] as const;

export type UpperSectionType = (typeof upperSections)[number];

export const lowerSections = [
  "3_kind",
  "4_kind",
  "full_house",
  "small_straight",
  "large_straight",
  "chance",
  "yatzy",
  "yatzy_bonus",
] as const;

export type LowerSectionType = (typeof lowerSections)[number];

export type Player = {
  playerInfo: PlayerInfo;
  scoreData: PlayerScoreData;
};

export type PlayerInfo = {
  id: string;
  name: string;
};

export type PlayerScoreData = {
  upperSection: Partial<Record<UpperSectionType, number>>;
  lowerSection: Partial<Record<LowerSectionType, number>>;
};

export const diceOrdered = [1, 2, 3, 4, 5, 6] as const;

export type Dice = (typeof diceOrdered)[number];

export type DiceState = {
  diceSet: [Dice, Dice, Dice, Dice, Dice];
  keepIndexes: number[];
};

export type TotalScore = {
  upper: number;
  lower: number;
  total: number;
};
