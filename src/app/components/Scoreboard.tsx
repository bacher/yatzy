import { CSSProperties } from "react";
import classNames from "classnames";
import { lowerFirst } from "lodash";

import {
  CategoryId,
  lowerCategories,
  LowerCategoryId,
  TotalScore,
  upperCategories,
  UpperCategoryId,
} from "@/gameLogic/types";
import { diceSymbols, upperCategoryToDice } from "@/gameLogic/consts";
import { PlayerInfo } from "@/OnlineGameDurableObject";

const upperSectionTitles: Record<UpperCategoryId, string> = {
  ones: "Aces",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
};

const lowerSectionTitles: Record<LowerCategoryId, string> = {
  kind_3: "3 of a kind",
  kind_4: "4 of a kind",
  full_house: "Full house",
  small_straight: "Small straight",
  large_straight: "Large straight",
  chance: "Chance",
  yahtzee: "Yahtzee",
};

const lowerSectionHints: Partial<Record<LowerCategoryId, string>> = {
  small_straight: "Sequence of 4",
  large_straight: "Sequence of 5",
  yahtzee: "5 of a kind",
};

const lowerSectionScoring: Record<LowerCategoryId, string> = {
  kind_3: "Add total of all dice",
  kind_4: "Add total of all dice",
  full_house: "Score 25",
  small_straight: "Score 30",
  large_straight: "Score 40",
  chance: "Add total of all 5 dice",
  yahtzee: "Score 50",
};

export type ScoreboardCategoryScore = {
  score: number | undefined;
  possibleScore: number | undefined;
};

export type ScoreboardScoreData = {
  upperSection: Record<UpperCategoryId, ScoreboardCategoryScore>;
  lowerSection: Record<LowerCategoryId, ScoreboardCategoryScore>;
  yatzyBonusAvailable: boolean;
};

export type ScoreboardPlayer = {
  playerInfo: PlayerInfo;
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
    if (score.score !== undefined && score.score !== 0) {
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
      className={classNames("g-button-reset", "scoreboard__row__score", {
        ["scoreboard__row__score_temporary"]: score.possibleScore !== undefined,
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
  scoreboard: ScoreboardPlayer[];
  activePlayerId: string | undefined;
  isPlayerTurn: boolean;
  onCategorySelect: (categoryId: CategoryId) => void;
};

export const Scoreboard = ({
  scoreboard,
  activePlayerId,
  isPlayerTurn,
  onCategorySelect,
}: ScoreboardProps) => {
  return (
    <div
      className="scoreboard"
      style={
        {
          "--players-count": scoreboard.length,
        } as CSSProperties
      }
    >
      <div className="scoreboard__row scoreboard__row_title">
        <div>Upper section</div>
        <div>How to score</div>
        {scoreboard.map(({ playerInfo: { id, name } }) => (
          <div
            key={id}
            className={classNames({
              ["scoreboard__row__player-name_active"]: id === activePlayerId,
              ["scoreboard__row__player-name_your-turn"]:
                id === activePlayerId && isPlayerTurn,
            })}
          >
            {name}
          </div>
        ))}
      </div>
      {upperCategories.map((categoryId) => (
        <div key={categoryId} className="scoreboard__row">
          <div className="scoreboard__row__category">
            <span className="scoreboard__row__category-icon">
              {diceSymbols[upperCategoryToDice[categoryId]]}
            </span>{" "}
            {upperSectionTitles[categoryId]}
          </div>
          <div className="scoreboard__row__scoring">
            Add only {lowerFirst(upperSectionTitles[categoryId])}
          </div>
          {scoreboard.map(({ playerInfo, scoreData }) => {
            const score = scoreData.upperSection[categoryId];

            return (
              <ScoreCell
                key={playerInfo.id}
                score={score}
                clickable={
                  isPlayerTurn &&
                  score.score === undefined &&
                  activePlayerId !== undefined &&
                  playerInfo.id === activePlayerId
                }
                onClick={() => {
                  onCategorySelect(categoryId);
                }}
              />
            );
          })}
        </div>
      ))}
      <div className="scoreboard__row">
        <div>Total Score</div>
        <div></div>
        {scoreboard.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.upperTotal}</div>
        ))}
      </div>
      <div className="scoreboard__row">
        <div className="scoreboard__row__category scoreboard__row__category_with-hint">
          Bonus{" "}
          <span className="scoreboard__row__hint">
            If total score 63 or above
          </span>
        </div>
        <div className="scoreboard__row__scoring">Score 35</div>
        {scoreboard.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.upperBonus}</div>
        ))}
      </div>
      <div className="scoreboard__row">
        <div>Total</div>
        <div></div>
        {scoreboard.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.upperTotal}</div>
        ))}
      </div>
      <div className="scoreboard__row scoreboard__row_title">
        <div>Lower section</div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {lowerCategories.map((categoryId) => (
        <div key={categoryId} className="scoreboard__row">
          <div className="scoreboard__row__category scoreboard__row__category_with-hint">
            {lowerSectionTitles[categoryId]}
            {lowerSectionHints[categoryId] && (
              <>
                {" "}
                <span className="scoreboard__row__hint">
                  {lowerSectionHints[categoryId]}
                </span>
              </>
            )}
          </div>
          <div className="scoreboard__row__scoring">
            {lowerSectionScoring[categoryId]}
          </div>
          {scoreboard.map(({ playerInfo, scoreData }) => {
            const score = scoreData.lowerSection[categoryId];

            return (
              <ScoreCell
                key={playerInfo.id}
                score={score}
                clickable={
                  isPlayerTurn &&
                  score.score === undefined &&
                  activePlayerId !== undefined &&
                  playerInfo.id === activePlayerId
                }
                onClick={() => {
                  onCategorySelect(categoryId);
                }}
              />
            );
          })}
        </div>
      ))}
      <div className="scoreboard__row">
        <div>Yahtzee Bonus</div>
        <div className="scoreboard__row__scoring">Score 100 for each bonus</div>
        {scoreboard.map(({ playerInfo, scoreData, total }) => (
          <ScoreCell
            key={playerInfo.id}
            score={{
              score: total.lowerBonus,
              possibleScore: scoreData.yatzyBonusAvailable
                ? total.lowerBonus + 100
                : undefined,
            }}
            clickable={false}
            onClick={() => undefined}
          />
        ))}
      </div>
      <div className="scoreboard__row">
        <div>Total</div>
        <div></div>
        {scoreboard.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.lowerTotal}</div>
        ))}
      </div>
      <div className="scoreboard__row">
        <div>Grand Total</div>
        <div></div>
        {scoreboard.map(({ playerInfo, total }) => (
          <div key={playerInfo.id}>{total.grandTotal}</div>
        ))}
      </div>
    </div>
  );
};
