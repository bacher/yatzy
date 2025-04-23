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
    <div className="dice_board">
      <div className="dice_board__section">
        {playDice.length > 0 ? (
          <>
            <ul className="dice_board__dice_list">
              {playDice.map(({ dice, diceIndex }) => (
                <li key={diceIndex} className="dice_board__dice_list_item">
                  <button
                    type="button"
                    title="Keep dice"
                    className="g-button-reset dice_board__dice"
                    onClick={() => {
                      onKeepToggle(diceIndex, true);
                    }}
                  >
                    {diceSymbols[dice]}
                  </button>
                </li>
              ))}
            </ul>
            <div className="dice_board__roll_button_wrapper">
              {rollButton ?? (
                <div className="dice_board__hint">
                  You used your last reroll
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="dice_board__hint">
            You keep all dice, nothing to reroll.
          </div>
        )}
      </div>

      <div className="dice_board__section">
        <h3>Keep</h3>
        {keepDice.length > 0 ? (
          <ul className="dice_board__dice_list">
            {keepDice.map(({ dice, diceIndex }) => (
              <li key={diceIndex} className="dice_board__dice_list_item">
                <button
                  type="button"
                  title="Unkeep dice"
                  className="g-button-reset dice_board__dice dice_board__dice_remove"
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
          <div className="dice_board__hint">Click on dice to keep it</div>
        )}
      </div>
    </div>
  );
};
