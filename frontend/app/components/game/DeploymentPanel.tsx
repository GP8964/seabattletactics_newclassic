import { FLEET, type Language } from "../../game/game-data";
import { getShipLayout } from "../../game/game-engine";
import type { GameState } from "../../game/game-types";
import { translate } from "../../game/translations";
import { GameBoard } from "./GameBoard";

type Props = {
  game: GameState;
  language: Language;
  selectedShip: string;
  rotated: boolean;
  hoveredCell: number | null;
  onSelectShip: (shipId: string) => void;
  onRotate: () => void;
  onDeploy: (cell: number) => void;
  onHover: (cell: number) => void;
  onLeave: () => void;
  onBegin: () => void;
  onClear: () => void;
};

// DEPLOYMENT PANEL: ship selection, placement orientation, and own fleet board.
export function DeploymentPanel({
  game,
  language,
  selectedShip,
  rotated,
  hoveredCell,
  onSelectShip,
  onRotate,
  onDeploy,
  onHover,
  onLeave,
  onBegin,
  onClear,
}: Props) {
  const selectableShips = FLEET.filter((ship) => !game.placed[ship.id]);
  const selected = FLEET.find((ship) => ship.id === selectedShip);
  const preview =
    game.phase === "setup" && selected && hoveredCell !== null
      ? getShipLayout(selected, hoveredCell, rotated)
      : [];
  const deployedCount = Object.keys(game.placed).length;

  return (
    <section className="panel deployment-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">01 / {translate(language, "fleetSetup")}</p>
          <h2>{translate(language, "deployment")}</h2>
        </div>
        <span className="phase-pill">{deployedCount}/6</span>
      </div>

      <div className="budget-bar">
        <span>{translate(language, "budget")}</span>
        <strong><b>{60 - game.creditsUsed}</b><span> / 60 CR</span></strong>
      </div>

      {game.phase === "setup" && (
        <>
          <div className="deployment-controls">
            <label className="field-label" htmlFor="ship-picker">
              {translate(language, "shipField")}
            </label>
            <select
              id="ship-picker"
              value={selectedShip}
              onChange={(event) => onSelectShip(event.target.value)}
              disabled={selectableShips.length === 0}
            >
              {selectableShips.map((ship) => (
                <option value={ship.id} key={ship.id}>
                  {language === "jp" ? ship.jpName : ship.name} · {ship.length}
                </option>
              ))}
            </select>
            <button className="button button-outline" onClick={onRotate}>
              {translate(language, "rotate")}
            </button>
          </div>
          <p className="helper-copy">{translate(language, "setupHelp")}</p>
        </>
      )}

      <GameBoard
        title={translate(language, "yourFleet")}
        board="player"
        game={game}
        language={language}
        preview={preview}
        interactive={game.phase === "setup"}
        onCellClick={onDeploy}
        onCellEnter={onHover}
        onCellLeave={onLeave}
      />

      {game.phase === "setup" && (
        <div className="deployment-footer">
          <span className="muted-copy">
            {translate(language, "fleetCount", deployedCount)}
          </span>
          <div className="button-row">
            <button
              className="button button-primary"
              onClick={onBegin}
              disabled={deployedCount !== FLEET.length}
            >
              {translate(language, "begin")}
            </button>
            <button className="button button-quiet" onClick={onClear}>
              {translate(language, "clear")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
