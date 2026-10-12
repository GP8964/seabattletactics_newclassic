import { useEffect, useState } from "react";
import { FLEET, type Language } from "../../game/game-data";
import {
  beginBattle,
  clearFleet,
  createGame,
  deployShip,
  fireAt,
  getAttackPreviewPattern,
} from "../../game/game-engine";
import type { GameState } from "../../game/game-types";
import { translate } from "../../game/translations";
import { CombatPanel } from "./CombatPanel";
import { DeploymentPanel } from "./DeploymentPanel";
import { GameHeader } from "./GameHeader";

// SEA BATTLE GAME: coordinates state and the reusable game interface panels.
export function SeaBattleGame() {
  const [game, setGame] = useState<GameState>(createGame);
  const [language, setLanguage] = useState<Language>("en");
  const [selectedShip, setSelectedShip] = useState(FLEET[0].id);
  const [rotated, setRotated] = useState(false);
  const [weapon, setWeapon] = useState("normal");
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  useEffect(() => {
    document.documentElement.lang = language === "jp" ? "ja" : "en";
  }, [language]);

  useEffect(() => {
    if (weapon === "normal") return;
    const [shipId] = weapon.split(":");
    if (game.placed[shipId]?.sunk) setWeapon("normal");
  }, [game.placed, weapon]);

  const deploy = (cell: number) => {
    const next = deployShip(game, selectedShip, cell, rotated);
    setGame(next);
    const placedShip = next.placed[selectedShip];
    if (placedShip) {
      const remainingShip = FLEET.find((ship) => !next.placed[ship.id]);
      if (remainingShip) setSelectedShip(remainingShip.id);
    }
    setHoveredCell(null);
  };

  const changeLanguage = () => {
    setLanguage((current) => (current === "en" ? "jp" : "en"));
  };

  const resetGame = () => {
    setGame(createGame());
    setSelectedShip(FLEET[0].id);
    setRotated(false);
    setWeapon("normal");
    setHoveredCell(null);
  };

  const preview = (cell: number) => {
    setHoveredCell(cell);
  };

  const fire = (cell: number) => {
    setGame(fireAt(game, cell, weapon));
    setHoveredCell(null);
  };

  return (
    <div className="game-shell">
      <GameHeader
        language={language}
        onLanguageChange={changeLanguage}
        onNewGame={resetGame}
      />
      <main className="game-main">
        <section className="mission-banner">
          <div className="mission-copy">
            <span className="mission-kicker">
              {translate(language, "missionSector")}
            </span>
            <h2>
              {translate(language, "missionTitle")}
            </h2>
            <p>{translate(language, "missionDescription")}</p>
          </div>
          <div className="mission-signal" aria-hidden="true">
            <span />
            <span />
            <span />
            <b>08</b>
          </div>
        </section>

        <div className="game-layout">
          <DeploymentPanel
            game={game}
            language={language}
            selectedShip={selectedShip}
            rotated={rotated}
            hoveredCell={game.phase === "setup" ? hoveredCell : null}
            onSelectShip={setSelectedShip}
            onRotate={() => setRotated((current) => !current)}
            onDeploy={deploy}
            onHover={preview}
            onLeave={() => setHoveredCell(null)}
            onBegin={() => {
              setGame(beginBattle(game));
              setHoveredCell(null);
            }}
            onClear={() => {
              setGame(clearFleet());
              setSelectedShip(FLEET[0].id);
              setRotated(false);
              setWeapon("normal");
              setHoveredCell(null);
            }}
          />
          <CombatPanel
            game={game}
            language={language}
            weapon={weapon}
            hoveredCell={game.phase === "battle" ? hoveredCell : null}
            onWeaponChange={setWeapon}
            onFire={fire}
            onHover={preview}
            onLeave={() => setHoveredCell(null)}
          />
        </div>
      </main>
      <footer className="game-footer">
        <span>SEA BATTLE TACTICS</span>
        <span>
          {translate(language, "title")} ·{" "}
          {translate(language, "prototypeLabel")}
        </span>
      </footer>
    </div>
  );
}

export default SeaBattleGame;
