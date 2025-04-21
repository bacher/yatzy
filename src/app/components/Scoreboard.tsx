import {
  lowerSections,
  LowerSectionType,
  Player,
  TotalScore,
  upperSections,
  UpperSectionType,
} from "@/logic/types";
import classNames from "classnames";
import { diceSymbols, upperCategoryToDice } from "@/logic/consts";
import { lowerFirst } from "lodash";

const upperSectionTitles: Record<UpperSectionType, string> = {
  ones: "Aces",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
};

const lowerSectionTitles: Record<LowerSectionType, string> = {
  "3_kind": "3 of a kind",
  "4_kind": "4 of a kind",
  full_house: "Full house",
  small_straight: "Small straight",
  large_straight: "Large straight",
  chance: "Chance",
  yatzy: "Yatzy",
  yatzy_bonus: "Yatzy Bonus",
};

const lowerSectionHints: Partial<Record<LowerSectionType, string>> = {
  small_straight: "Sequence of 4",
  large_straight: "Sequence of 5",
  yatzy: "5 of a kind",
};

const lowerSectionScoring: Record<LowerSectionType, string> = {
  "3_kind": "Add total of all dice",
  "4_kind": "Add total of all dice",
  full_house: "Score 25",
  small_straight: "Score 30",
  large_straight: "Score 40",
  chance: "Add total of all 5 dice",
  yatzy: "Score 50",
  yatzy_bonus: "Score 100 for each bonus",
};

export type ScoreboardCategoryScore = {
  score: number;
  isTemporary: boolean;
};

export type ScoreboardScoreData = {
  upperSection: Partial<Record<UpperSectionType, ScoreboardCategoryScore>>;
  lowerSection: Partial<Record<LowerSectionType, ScoreboardCategoryScore>>;
};

export type ScoreboardPlayer = Omit<Player, "scoreData"> & {
  scoreData: ScoreboardScoreData;
  total: TotalScore;
};

const ScoreCell = ({
  score,
}: {
  score: ScoreboardCategoryScore | undefined;
}) => {
  return (
    <div
      className={classNames("scoreboard__row__score", {
        ["scoreboard__row__score_temporary"]: score?.isTemporary,
      })}
    >
      {score?.score}
    </div>
  );
};

type ScoreboardProps = {
  players: ScoreboardPlayer[];
};

export const Scoreboard = ({ players }: ScoreboardProps) => {
  return (
    <div className="scoreboard">
      <div className="scoreboard__row scoreboard__row_title">
        <div>Upper section</div>
        <div>How to score</div>
        {players.map(({ playerInfo: { id, name } }) => (
          <div key={id}>{name}</div>
        ))}
      </div>
      {upperSections.map((id) => (
        <div key={id} className="scoreboard__row">
          <div className="scoreboard__row__category scoreboard__row__category_with_icon">
            <span>{diceSymbols[upperCategoryToDice[id]]}</span>{" "}
            {upperSectionTitles[id]}
          </div>
          <div className="scoreboard__row__scoring">
            Add only {lowerFirst(upperSectionTitles[id])}
          </div>
          {players.map(({ playerInfo, scoreData }) => (
            <ScoreCell key={playerInfo.id} score={scoreData.upperSection[id]} />
          ))}
        </div>
      ))}
      <div className="scoreboard__row">
        <div>Total Score</div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="scoreboard__row">
        <div className="scoreboard__row__category scoreboard__row__category_with_hint">
          Bonus{" "}
          <span className="scoreboard__row__hint">
            If total score 63 or above
          </span>
        </div>
        <div className="scoreboard__row__scoring">Score 35</div>
        <div></div>
        <div></div>
      </div>
      <div className="scoreboard__row">
        <div>Total</div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="scoreboard__row scoreboard__row_title">
        <div>Lower section</div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {lowerSections.map((id) => (
        <div key={id} className="scoreboard__row">
          <div className="scoreboard__row__category scoreboard__row__category_with_hint">
            {lowerSectionTitles[id]}
            {lowerSectionHints[id] && (
              <>
                {" "}
                <span className="scoreboard__row__hint">
                  {lowerSectionHints[id]}
                </span>
              </>
            )}
          </div>
          <div className="scoreboard__row__scoring">
            {lowerSectionScoring[id]}
          </div>
          {players.map(({ playerInfo, scoreData }) => (
            <ScoreCell key={playerInfo.id} score={scoreData.lowerSection[id]} />
          ))}
        </div>
      ))}
      <div className="scoreboard__row">
        <div>Total</div>
        <div></div>
        <div></div>
      </div>
      <div className="scoreboard__row">
        <div>Grand Total</div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};
