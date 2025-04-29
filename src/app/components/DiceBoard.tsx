import { DiceState } from "@/gameLogic/types";
import { diceSymbols } from "@/gameLogic/consts";
import { partition, sortBy } from "lodash";
import { ReactNode, useMemo } from "react";
import classNames from "classnames";

type DiceBoardProps = DiceState & {
  isPlayerTurn: boolean;
  remainedRerolls: number;
  rollButton: ReactNode;
  onKeepToggle: (diceIndex: number, keep: boolean) => void;
};

export const DiceBoard = ({
  diceSet,
  keepIndexes,
  isPlayerTurn,
  remainedRerolls,
  rollButton,
  onKeepToggle,
}: DiceBoardProps) => {
  const diceList = useMemo(
    () =>
      sortBy(
        diceSet.map((dice, diceIndex) => ({
          dice,
          diceIndex,
          keep: keepIndexes.includes(diceIndex),
        })),
        "dice",
      ),
    [diceSet, keepIndexes],
  );

  const [keepDice, playDice] = useMemo(
    () => partition(diceList, ({ keep }) => keep),
    [diceList],
  );

  return (
    <div className="dice-board">
      <div className="dice-board__section">
        {diceList.length > 0 ? (
          <>
            <ul className="dice-board__dice-list">
              {diceList.map(({ dice, diceIndex, keep }, visualIndex) => (
                <li
                  key={diceIndex}
                  className="dice-board__dice-list-item"
                  style={
                    keep
                      ? {
                          transform: `translate(${(keepDice.findIndex((keepDice) => keepDice.diceIndex === diceIndex) - (keepDice.length - 1) / 2) * 56}px, 160px)`,
                        }
                      : {
                          transform: `translate(${(playDice.findIndex((playDice) => playDice.diceIndex === diceIndex) - (playDice.length - 1) / 2) * 56}px, 0)`,
                        }
                  }
                >
                  <button
                    type="button"
                    title={keep ? "Unkeep dice" : "Keep dice"}
                    className={classNames(
                      "g-button-reset",
                      "dice-board__dice",
                      {
                        ["dice-board__dice_remove"]: keep,
                      },
                    )}
                    disabled={!isPlayerTurn}
                    onClick={() => {
                      onKeepToggle(diceIndex, !keep);
                    }}
                  >
                    {diceSymbols[dice]}
                  </button>
                </li>
              ))}
            </ul>
            <div className="dice-board__actions">
              {remainedRerolls && isPlayerTurn ? (
                <div className="dice-board__roll-button-wrapper">
                  {rollButton}
                </div>
              ) : (
                !remainedRerolls && (
                  <div className="dice-board__hint">
                    {isPlayerTurn
                      ? "You used your last reroll"
                      : "Last reroll is used"}
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          isPlayerTurn && (
            <div className="dice-board__hint">
              You keep all dice, nothing to reroll.
            </div>
          )
        )}
      </div>

      <div className="dice-board__section">
        <h3>Keep</h3>
        <div className="dice-board__keep-items">
          {!keepDice.length && (
            <div className="dice-board__hint">
              {isPlayerTurn ? "Click on dice to keep it" : "Empty"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
