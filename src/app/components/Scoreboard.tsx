import {
  lowerCategories,
  LowerCategory,
  Player,
  TotalScore,
  upperCategories,
  UpperCategory,
} from "@/logic/types";
import classNames from "classnames";
import { diceSymbols, upperCategoryToDice } from "@/logic/consts";
import { lowerFirst } from "lodash";

const upperSectionTitles: Record<UpperCategory, string> = {
  ones: "Aces",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
};

const lowerSectionTitles: Record<LowerCategory, string> = {
  kind_3: "3 of a kind",
  kind_4: "4 of a kind",
  full_house: "Full house",
  small_straight: "Small straight",
  large_straight: "Large straight",
  chance: "Chance",
  yatzy: "Yatzy",
  yatzy_bonus: "Yatzy Bonus",
};

const lowerSectionHints: Partial<Record<LowerCategory, string>> = {
  small_straight: "Sequence of 4",
  large_straight: "Sequence of 5",
  yatzy: "5 of a kind",
};

const lowerSectionScoring: Record<LowerCategory, string> = {
  kind_3: "Add total of all dice",
  kind_4: "Add total of all dice",
  full_house: "Score 25",
  small_straight: "Score 30",
  large_straight: "Score 40",
  chance: "Add total of all 5 dice",
  yatzy: "Score 50",
  yatzy_bonus: "Score 100 for each bonus",
};

export type ScoreboardCategoryScore = {
  score: number | undefined;
  possibleScore: number | undefined;
};

export type ScoreboardScoreData = {
  upperSection: Record<UpperCategory, ScoreboardCategoryScore>;
  lowerSection: Record<LowerCategory, ScoreboardCategoryScore>;
};

export type ScoreboardPlayer = Omit<Player, "scoreData"> & {
  scoreData: ScoreboardScoreData;
  total: TotalScore;
};

const ScoreCell = ({
  score,
  clickable,
  onClick,
}: {
  score: ScoreboardCategoryScore;
  clickable: boolean;
  onClick: () => void;
}) => {
  let scoreString: string | undefined;

  if (score.possibleScore !== undefined) {
    if (score.score !== undefined) {
      scoreString = `+${score.possibleScore - score.score}`;
    } else {
      scoreString = `${score.possibleScore}`;
    }
  } else if (score.score !== undefined) {
    scoreString = `${score.score}`;
  }

  return (
    <button
      type="button"
      disabled={!clickable}
      className={classNames("scoreboard__row__score", {
        ["scoreboard__row__score_temporary"]: score.score == undefined,
        ["scoreboard__row__score_clickable"]: clickable,
        ["scoreboard__row__score_empty"]: !scoreString,
      })}
      onClick={onClick}
    >
      {scoreString}
    </button>
  );
};

type ScoreboardProps = {
  players: ScoreboardPlayer[];
  activePlayerId: string | undefined;
  onCategorySelect: (
    categoryId: UpperCategory | LowerCategory,
    updatedScore: number,
  ) => void;
};

export const Scoreboard = ({
  players,
  activePlayerId,
  onCategorySelect,
}: ScoreboardProps) => {
  return (
    <div className="scoreboard">
      <div className="scoreboard__row scoreboard__row_title">
        <div>Upper section</div>
        <div>How to score</div>
        {players.map(({ playerInfo: { id, name } }) => (
          <div key={id}>{name}</div>
        ))}
      </div>
      {upperCategories.map((id) => (
        <div key={id} className="scoreboard__row">
          <div className="scoreboard__row__category">
            <span className="scoreboard__row__category_icon">
              {diceSymbols[upperCategoryToDice[id]]}
            </span>{" "}
            {upperSectionTitles[id]}
          </div>
          <div className="scoreboard__row__scoring">
            Add only {lowerFirst(upperSectionTitles[id])}
          </div>
          {players.map(({ playerInfo, scoreData }) => {
            const score = scoreData.upperSection[id];

            return (
              <ScoreCell
                key={playerInfo.id}
                score={score}
                clickable={
                  score.score === undefined &&
                  activePlayerId !== undefined &&
                  playerInfo.id === activePlayerId
                }
                onClick={() => {
                  onCategorySelect(id, score.possibleScore ?? 0);
                }}
              />
            );
          })}
        </div>
      ))}
      <div className="scoreboard__row">
        <div>Total Score</div>
        <div></div>
        {players.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.upperTotal}</div>
        ))}
      </div>
      <div className="scoreboard__row">
        <div className="scoreboard__row__category scoreboard__row__category_with_hint">
          Bonus{" "}
          <span className="scoreboard__row__hint">
            If total score 63 or above
          </span>
        </div>
        <div className="scoreboard__row__scoring">Score 35</div>
        {players.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.upperBonus}</div>
        ))}
      </div>
      <div className="scoreboard__row">
        <div>Total</div>
        <div></div>
        {players.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.upperTotal}</div>
        ))}
      </div>
      <div className="scoreboard__row scoreboard__row_title">
        <div>Lower section</div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {lowerCategories.map((id) => (
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
          {players.map(({ playerInfo, scoreData }) => {
            const score = scoreData.lowerSection[id];

            return (
              <ScoreCell
                key={playerInfo.id}
                score={score}
                clickable={
                  score.score === undefined &&
                  activePlayerId !== undefined &&
                  playerInfo.id === activePlayerId &&
                  (id !== "yatzy_bonus" || score.possibleScore !== undefined)
                }
                onClick={() => {
                  onCategorySelect(id, score.possibleScore ?? 0);
                }}
              />
            );
          })}
        </div>
      ))}
      <div className="scoreboard__row">
        <div>Total</div>
        <div></div>
        {players.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.lowerTotal}</div>
        ))}
      </div>
      <div className="scoreboard__row">
        <div>Grand Total</div>
        <div></div>
        {players.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.grandTotal}</div>
        ))}
      </div>
    </div>
  );
};
