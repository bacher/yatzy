import { DiceState } from "@/logic/types";
import { diceSymbols } from "@/logic/consts";

type DiceBoardProps = DiceState & {
  allowKeeping: boolean;
  onKeepToggle: (diceIndex: number, keep: boolean) => void;
};

export const DiceBoard = ({
  diceSet,
  keepIndexes,
  allowKeeping,
  onKeepToggle,
}: DiceBoardProps) => {
  return (
    <ul className="dice_board__dice_list">
      {diceSet.map((dice, diceIndex) => (
        <li key={diceIndex} className="dice_board__dice_list_item">
          <span className="dice_board__dice">{diceSymbols[dice]}</span>
          {allowKeeping && (
            <>
              {keepIndexes.includes(diceIndex) && <span>kept</span>}
              {keepIndexes.includes(diceIndex) ? (
                <button
                  type="button"
                  onClick={() => {
                    onKeepToggle(diceIndex, false);
                  }}
                >
                  unkeep
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onKeepToggle(diceIndex, true);
                  }}
                >
                  keep
                </button>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
};
