import { sortBy } from "lodash";

import type { ScoreboardPlayer } from "@/app/components/Scoreboard";

type GameOverResultsProps = {
  scoreboardPlayers: ScoreboardPlayer[];
};

export const GameOverResults = ({
  scoreboardPlayers,
}: GameOverResultsProps) => {
  const orderedPlayers = sortBy(
    scoreboardPlayers,
    (player) => player.total.grandTotal,
  );
  const biggestGrandTotal = orderedPlayers[0].total.grandTotal;

  const winners = scoreboardPlayers.filter(
    (player) => player.total.grandTotal === biggestGrandTotal,
  );

  return (
    <>
      <h2>Game results</h2>
      {(() => {
        if (scoreboardPlayers.length === 1) {
          return undefined;
        } else if (winners.length === scoreboardPlayers.length) {
          return <h2>Tie</h2>;
        } else if (winners.length === 1) {
          const winner = winners[0];

          return <h2>Winner is {winner.playerInfo.name}</h2>;
        } else {
          return (
            <h2>
              Winners:{" "}
              {winners.map((player) => player.playerInfo.name).join(", ")}
            </h2>
          );
        }
      })()}
      <h3>Total score: {biggestGrandTotal}</h3>
    </>
  );
};
