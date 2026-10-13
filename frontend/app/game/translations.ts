import type { Language } from "./game-data";
import { shipName } from "./game-data";

type Message = string | ((...values: (string | number)[]) => string);

const messages: Record<Language, Record<string, Message>> = {
  en: {
    title: "Sea Battle Tactics",
    navSubtitle: "NAVAL STRATEGY • SINGLE PLAYER",
    fleetSetup: "FLEET SETUP",
    operations: "OPERATIONS",
    shipField: "SHIP",
    weaponSystem: "WEAPON SYSTEM",
    standby: "STANDBY",
    events: "EVENTS",
    gameControls: "Game controls",
    prototypeLabel: "SINGLE PLAYER PROTOTYPE",
    phaseSetup: "SETUP",
    phaseBattle: "BATTLE",
    phaseOver: "OVER",
    legendFleet: "Fleet",
    legendHit: "Hit",
    legendMiss: "Miss",
    missionSector: "PACIFIC THEATRE / SECTOR 08",
    missionTitle: "Command the waters.",
    missionDescription: "Deploy your fleet. Locate the enemy. Control the sea.",
    deployment: "Fleet deployment",
    budget: "Equipment budget",
    rotate: "↻ Rotate",
    setupHelp:
      "Choose a ship, rotate if needed, then click your grid to deploy. Hover previews placement.",
    yourFleet: "Your fleet",
    enemyWaters: "Enemy waters",
    begin: "Begin battle",
    clear: "Clear deployment",
    fleetCount: (count) => `${count}/6 ships deployed`,
    combat: "Combat control",
    combatHelp:
      "Hover enemy waters to preview a strike. All cells in a multi-cell strike resolve together. Repeated cells count as misses.",
    ready: "Deploy all ships to begin.",
    yourTurn: "Your turn",
    pickProgress: (selected, total) =>
      `Select ${Number(total) - Number(selected)} more target cell(s) (${selected}/${total}). Changing weapon cancels this attack.`,
    detected: "Enemy fleet detected.",
    invalid: "Invalid placement.",
    missile: "Missile - free",
    log: "Combat log",
    newGame: "New game",
    sunk: "SUNK",
    enemyHit: "Enemy hit your ship.",
    enemyMiss: "Enemy missed.",
    victory: "Victory — enemy fleet neutralized.",
    radarResult: (detected, clear) =>
      `Radar scan: ${detected} signal(s) detected, ${clear} no signal.`,
    tomcatSunk: (shipId) =>
      `${shipName(String(shipId), "en")} sunk — Tomcat strike!`,
    enemySunk: (shipId) =>
      `Enemy ${shipName(String(shipId), "en")} sunk!`,
    shipSunk: (shipId) =>
      `${shipName(String(shipId), "en")} sunk! Its equipment is disabled.`,
    strikeResult: (hit, other) =>
      `Strike resolved: ${hit} hit(s), ${other} other cell(s).`,
    enemyFireAt: (coordinate) => `Enemy fires at ${coordinate}.`,
  },
  jp: {
    title: "Sea Battle Tactics",
    navSubtitle: "海上戦略 • シングルプレイヤー",
    fleetSetup: "艦隊配置",
    operations: "作戦",
    shipField: "艦艇",
    weaponSystem: "兵装システム",
    standby: "待機中",
    events: "記録",
    gameControls: "ゲーム操作",
    prototypeLabel: "シングルプレイヤー版",
    phaseSetup: "配置",
    phaseBattle: "戦闘",
    phaseOver: "終了",
    legendFleet: "艦隊",
    legendHit: "命中",
    legendMiss: "外れ",
    missionSector: "太平洋戦域 / セクター 08",
    missionTitle: "海域を制圧せよ。",
    missionDescription: "艦隊を配置し、敵を発見し、海を制圧せよ。",
    deployment: "艦隊配置",
    budget: "装備予算",
    rotate: "↻ 回転",
    setupHelp:
      "艦を選び、向きを決めて自軍グリッドをクリックすると配置できます。ホバーで配置を確認できます。",
    yourFleet: "自軍艦隊",
    enemyWaters: "敵海域",
    begin: "戦闘開始",
    clear: "配置をクリア",
    fleetCount: (count) => `${count}/6 隻を配置済み`,
    combat: "戦闘管制",
    combatHelp:
      "敵海域をホバーすると攻撃範囲を確認できます。複数マス攻撃は同時に判定されます。攻撃済みのマスは外れになります。",
    ready: "全艦を配置して戦闘を開始してください。",
    yourTurn: "自軍のターン",
    pickProgress: (selected, total) =>
      `攻撃目標をあと${Number(total) - Number(selected)}マス選択してください（${selected}/${total}）。兵装を変更すると攻撃はキャンセルされます。`,
    detected: "敵艦隊を探知しました。",
    invalid: "配置できません。",
    missile: "ミサイル - 無料",
    log: "戦闘ログ",
    newGame: "新しいゲーム",
    sunk: "撃沈",
    enemyHit: "敵弾が自軍艦に命中しました。",
    enemyMiss: "敵の攻撃は外れました。",
    victory: "勝利 — 敵艦隊を撃滅しました。",
    radarResult: (detected, clear) =>
      `レーダー走査: ${detected} 信号を探知、${clear} 信号なし。`,
    tomcatSunk: (shipId) =>
      `${shipName(String(shipId), "jp")} 撃沈 — トムキャット攻撃！`,
    enemySunk: (shipId) =>
      `敵の${shipName(String(shipId), "jp")}を撃沈！`,
    shipSunk: (shipId) =>
      `${shipName(String(shipId), "jp")}が撃沈されました。装備は使用できません。`,
    strikeResult: (hit, other) =>
      `攻撃結果: ${hit} マス命中、その他 ${other} マス。`,
    enemyFireAt: (coordinate) => `敵の攻撃地点: ${coordinate}。`,
  },
};

export function translate(
  language: Language,
  key: string,
  ...values: (string | number)[]
) {
  const message = messages[language][key];
  if (message === undefined) {
    throw new Error(`Missing ${language} translation: ${key}`);
  }
  return typeof message === "function" ? message(...values) : message;
}
