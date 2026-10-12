import { BOARD_SIZE, type Language } from "../../game/game-data";
import { getShipAtCell } from "../../game/game-engine";
import type { GameState } from "../../game/game-types";
import { translate } from "../../game/translations";
import { shipName } from "../../game/game-data";

type Props = {
  title: string;
  board: "player" | "enemy";
  game: GameState;
  language: Language;
  preview: number[];
  interactive: boolean;
  onCellClick: (cell: number) => void;
  onCellEnter: (cell: number) => void;
  onCellLeave: () => void;
};

// GAME BOARD: reusable 8x8 player and opponent grid with accessible cells.
export function GameBoard({
  title,
  board,
  game,
  language,
  preview,
  interactive,
  onCellClick,
  onCellEnter,
  onCellLeave,
}: Props) {
  const isPlayer = board === "player";
  const ships = isPlayer
    ? Object.values(game.placed)
    : game.enemyFleet.filter((ship) => ship.sunk);

  return (
    <section className="board-section" aria-label={title}>
      <div className="board-heading">
        <h3>{title}</h3>
        <span className="board-dimensions">8 × 8</span>
      </div>
      <div className="board-frame">
        <div className="axis axis-top" aria-hidden="true">
          {Array.from({ length: BOARD_SIZE }, (_, index) => (
            <span key={index}>{String.fromCharCode(65 + index)}</span>
          ))}
        </div>
        <div className="axis axis-side" aria-hidden="true">
          {Array.from({ length: BOARD_SIZE }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <div className={`game-board ${isPlayer ? "player-board" : "enemy-board"}`}>
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, cell) => {
            const ship = getShipAtCell(ships, cell);
            const enemyHit = !isPlayer && game.hits.includes(cell);
            const incomingHit = isPlayer && game.incomingHits.includes(cell);
            const sunk = isPlayer
              ? game.sunkPlayerCells.includes(cell)
              : game.sunkEnemyCells.includes(cell);
            const radar =
              !isPlayer && game.radarDetected.includes(cell)
                ? "radar-detected"
                : !isPlayer && game.radarClear.includes(cell)
                  ? "radar-clear"
                  : "";
            const missed = isPlayer
              ? game.incomingMisses.includes(cell)
              : game.misses.includes(cell);
            const near = !isPlayer && game.nearMisses.includes(cell);
            const cellClasses = [
              "board-cell",
              ship ? `ship-cell ship-${ship.shipId}` : "",
              enemyHit || incomingHit ? "hit-cell" : "",
              missed ? "miss-cell" : "",
              near ? "near-cell" : "",
              sunk ? "sunk-cell" : "",
              radar,
              preview.includes(cell) ? "preview-cell" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const col = String.fromCharCode(65 + (cell % BOARD_SIZE));
            const row = Math.floor(cell / BOARD_SIZE) + 1;
            const shipDescription = ship
              ? shipName(ship.shipId, language)
              : "";
            const mark = sunk
              ? translate(language, "sunk")
              : enemyHit || incomingHit
                ? "×"
                : missed
                  ? "·"
                  : near
                    ? "~"
                    : radar === "radar-detected"
                      ? "!"
                      : "";

            return (
              <button
                type="button"
                key={cell}
                className={cellClasses}
                aria-label={`${col}${row}${shipDescription ? `, ${shipDescription}` : ""}${mark ? `, ${mark}` : ""}`}
                title={shipDescription}
                disabled={!interactive}
                onClick={() => onCellClick(cell)}
                onMouseEnter={() => onCellEnter(cell)}
                onMouseLeave={onCellLeave}
              >
                {mark}
              </button>
            );
          })}
        </div>
      </div>
      <div className="board-legend" aria-label="Board legend">
        <span><i className="legend-ship" /> {translate(language, "legendFleet")}</span>
        <span><i className="legend-hit" /> {translate(language, "legendHit")}</span>
        <span><i className="legend-miss" /> {translate(language, "legendMiss")}</span>
      </div>
    </section>
  );
}
