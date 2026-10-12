import type { Language } from "../../game/game-data";
import { translate } from "../../game/translations";

type Props = {
  language: Language;
  onLanguageChange: () => void;
  onNewGame: () => void;
};

// GAME HEADER: project identity, language control, and game reset.
export function GameHeader({
  language,
  onLanguageChange,
  onNewGame,
}: Props) {
  return (
    <header className="game-header">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">SBT</span>
        <div>
          <p className="eyebrow">{translate(language, "navSubtitle")}</p>
          <h1>{translate(language, "title")}</h1>
        </div>
      </div>
      <nav
        className="header-actions"
        aria-label={translate(language, "gameControls")}
      >
        <button className="button button-quiet" onClick={onLanguageChange}>
          {language === "en" ? "日本語" : "English"}
        </button>
        <button className="button button-outline" onClick={onNewGame}>
          {translate(language, "newGame")}
        </button>
      </nav>
    </header>
  );
}
