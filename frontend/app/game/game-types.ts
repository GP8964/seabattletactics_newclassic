export type GamePhase = "setup" | "battle" | "over";

export type LogEntry = {
  key: string;
  values: (string | number)[];
};

export type PlacedShip = {
  shipId: string;
  cells: number[];
  hp: number;
  sunk: boolean;
};

export type GameState = {
  phase: GamePhase;
  placed: Record<string, PlacedShip>;
  enemyFleet: PlacedShip[];
  shots: number[];
  hits: number[];
  misses: number[];
  incoming: number[];
  incomingHits: number[];
  incomingMisses: number[];
  nearMisses: number[];
  sunkEnemyCells: number[];
  sunkPlayerCells: number[];
  radarDetected: number[];
  radarClear: number[];
  creditsUsed: number;
  statusKey: string;
  log: LogEntry[];
};
