import { EQUIPMENT_BUDGET, FLEET, type Language } from "../../game/game-data";
import { equipmentName } from "../../game/game-data";
import { getAttackPreviewPattern } from "../../game/game-engine";
import type { GameState } from "../../game/game-types";
import { translate } from "../../game/translations";
import { GameBoard } from "./GameBoard";

type Props = {
  game: GameState;
  language: Language;
  weapon: string;
  hoveredCell: number | null;
  onWeaponChange: (weapon: string) => void;
  onFire: (cell: number) => void;
  onHover: (cell: number) => void;
  onLeave: () => void;
};

// COMBAT PANEL: enemy waters, attack selection, battle status, and event log.
export function CombatPanel({
  game,
  language,
  weapon,
  hoveredCell,
  onWeaponChange,
  onFire,
  onHover,
  onLeave,
}: Props) {
  const [weaponShipId, equipmentIndex] = weapon.split(":");
  const equipment = FLEET.find((ship) => ship.id === weaponShipId)?.equipment[
    Number(equipmentIndex)
  ];
  const preview =
    hoveredCell === null
      ? []
      : weapon === "normal"
        ? [hoveredCell]
        : equipment
          ? getAttackPreviewPattern(equipment.pattern, hoveredCell)
          : [];

  return (
    <section className="panel combat-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / {translate(language, "operations")}</p>
          <h2>{translate(language, "combat")}</h2>
        </div>
        <span className={`phase-indicator phase-${game.phase}`}>
          {translate(
            language,
            game.phase === "setup"
              ? "standby"
              : `phase${game.phase[0].toUpperCase()}${game.phase.slice(1)}`,
          )}
        </span>
      </div>

      <div className="weapon-control">
        <label className="field-label" htmlFor="weapon-picker">
          {translate(language, "weaponSystem")}
        </label>
        <select
          id="weapon-picker"
          value={weapon}
          onChange={(event) => onWeaponChange(event.target.value)}
          disabled={game.phase !== "battle"}
        >
          <option value="normal">{translate(language, "missile")}</option>
          {FLEET.flatMap((ship) =>
            ship.equipment.map((item, index) => {
              const value = `${ship.id}:${index}`;
              const hull = game.placed[ship.id];
              const destroyed = hull?.sunk === true;
              const outOfBudget =
                game.creditsUsed + item.cost > EQUIPMENT_BUDGET;
              return (
                <option
                  key={value}
                  value={value}
                  disabled={destroyed || outOfBudget || game.phase !== "battle"}
                >
                  {language === "jp" ? ship.jpName : ship.name} /{" "}
                  {equipmentName(item, language)} ({item.cost} CR)
                  {destroyed ? (language === "jp" ? " · 撃沈" : " · SUNK") : ""}
                </option>
              );
            }),
          )}
        </select>
      </div>

      <p className="helper-copy combat-helper">
        {translate(language, "combatHelp")}
      </p>
      <GameBoard
        title={translate(language, "enemyWaters")}
        board="enemy"
        game={game}
        language={language}
        preview={preview}
        interactive={game.phase === "battle"}
        onCellClick={onFire}
        onCellEnter={onHover}
        onCellLeave={onLeave}
      />

      <div className={`battle-status status-${game.phase}`} role="status">
        <span className="status-light" />
        {translate(language, game.statusKey)}
      </div>

      <section className="log-section" aria-labelledby="combat-log-title">
        <div className="log-heading">
          <h3 id="combat-log-title">{translate(language, "log")}</h3>
          <span>
            {String(game.log.length).padStart(2, "0")}{" "}
            {translate(language, "events")}
          </span>
        </div>
        <div className="combat-log" aria-live="polite">
          {game.log.length === 0 ? (
            <p className="log-empty">
              {language === "jp"
                ? "戦闘開始後、ここに作戦記録が表示されます。"
                : "Operations log will appear here once battle begins."}
            </p>
          ) : (
            game.log.map((entry, index) => (
              <p className="log-entry" key={`${entry.key}-${index}`}>
                <span className="log-index">{String(index + 1).padStart(2, "0")}</span>
                {translate(language, entry.key, ...entry.values)}
              </p>
            ))
          )}
        </div>
      </section>
    </section>
  );
}
