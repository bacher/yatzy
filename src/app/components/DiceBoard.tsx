import { DiceState } from "@/logic/types";
import { diceSymbols } from "@/logic/consts";
import { sortBy } from "lodash";
import { ReactNode, useMemo } from "react";

type DiceBoardProps = DiceState & {
  rollButton: ReactNode | undefined;
  onKeepToggle: (diceIndex: number, keep: boolean) => void;
};

export const DiceBoard = ({
  diceSet,
  keepIndexes,
  rollButton,
  onKeepToggle,
}: DiceBoardProps) => {
  const sortedIndexedDiceSet = useMemo(
    () =>
      sortBy(
        diceSet.map((dice, index) => ({
          dice,
          diceIndex: index,
        })),
        "dice",
      ),
    [diceSet],
  );

  const playDice = sortedIndexedDiceSet.filter(
    ({ diceIndex }) => !keepIndexes.includes(diceIndex),
  );

  const keepDice = sortedIndexedDiceSet.filter(({ diceIndex }) =>
    keepIndexes.includes(diceIndex),
  );

  return (
    <div className="dice-board">
      <div className="dice-board__section">
        {playDice.length > 0 ? (
          <>
            <ul className="dice-board__dice-list">
              {playDice.map(({ dice, diceIndex }) => (
                <li key={diceIndex} className="dice-board__dice-list-item">
                  <button
                    type="button"
                    title="Keep dice"
                    className="g-button-reset dice-board__dice"
                    onClick={() => {
                      onKeepToggle(diceIndex, true);
                    }}
                  >
                    {diceSymbols[dice]}
                  </button>
                </li>
              ))}
            </ul>
            <div className="dice-board__roll-button-wrapper">
              {rollButton ?? (
                <div className="dice-board__hint">
                  You used your last reroll
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="dice-board__hint">
            You keep all dice, nothing to reroll.
          </div>
        )}
      </div>

      <div className="dice-board__section">
        <h3>Keep</h3>
        {keepDice.length > 0 ? (
          <ul className="dice-board__dice-list">
            {keepDice.map(({ dice, diceIndex }) => (
              <li key={diceIndex} className="dice-board__dice-list-item">
                <button
                  type="button"
                  title="Unkeep dice"
                  className="g-button-reset dice-board__dice dice-board__dice_remove"
                  onClick={() => {
                    onKeepToggle(diceIndex, false);
                  }}
                >
                  {diceSymbols[dice]}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="dice-board__hint">Click on dice to keep it</div>
        )}
      </div>
    </div>
  );
};
