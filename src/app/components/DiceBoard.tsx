import { ReactNode, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { partition, sortBy } from "lodash";

import { DiceState } from "@/gameLogic/types";
import { diceSymbols } from "@/gameLogic/consts";

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
  const [diceSetMemo, setDiceSetMemo] = useState(() => diceSet);

  if (diceSetMemo !== diceSet && !areArraysEqual(diceSetMemo, diceSet)) {
    setDiceSetMemo(diceSet);
  }

  const rollIndexRef = useRef(0);

  const previousDiceSet = useRef(diceSetMemo);
  if (previousDiceSet.current !== diceSetMemo) {
    rollIndexRef.current += 1;
    previousDiceSet.current = diceSetMemo;
  }

  const diceList = useMemo(
    () =>
      sortBy(
        diceSetMemo.map((dice, diceIndex) => ({
          dice,
          diceIndex,
          keep: keepIndexes.includes(diceIndex),
        })),
        "dice",
      ),
    [diceSetMemo, keepIndexes.join(",")],
  );

  const [keepDice, playDice] = useMemo(
    () => partition(diceList, ({ keep }) => keep),
    [diceList],
  );

  return (
    <div className="dice-board">
      <div className="dice-board__section">
        <ul className="dice-board__dice-list">
          {diceList.map(({ dice, diceIndex, keep }) => (
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
                key={keep ? "keep" : rollIndexRef.current}
                type="button"
                title={keep ? "Unkeep dice" : "Keep dice"}
                className={classNames("g-button-reset", "dice-board__dice", {
                  ["dice-board__dice_remove"]: keep,
                  ["dice-board__dice_animate"]: !keep,
                })}
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
            <div className="dice-board__roll-button-wrapper">{rollButton}</div>
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

function areArraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
