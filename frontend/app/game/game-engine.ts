import {
  BOARD_SIZE,
  EQUIPMENT_BUDGET,
  FLEET,
  type FleetShip,
} from "./game-data";
import type { GameState, PlacedShip } from "./game-types";

const boardCells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => i);
const coordinates = (cell: number) => [cell % BOARD_SIZE, Math.floor(cell / BOARD_SIZE)];
const cellAt = (x: number, y: number) => y * BOARD_SIZE + x;
const isRadar = (pattern: string) => ["radar", "sps5", "radar5"].includes(pattern);

export function createGame(): GameState {
  return {
    phase: "setup",
    placed: {},
    enemyFleet: [],
    shots: [],
    hits: [],
    misses: [],
    incoming: [],
    incomingHits: [],
    incomingMisses: [],
    nearMisses: [],
    sunkEnemyCells: [],
    sunkPlayerCells: [],
    radarDetected: [],
    radarClear: [],
    creditsUsed: 0,
    statusKey: "ready",
    log: [],
  };
}

export function getShipLayout(ship: FleetShip, anchor: number, rotated: boolean) {
  const [x, y] = coordinates(anchor);
  const width =
    ship.id === "cv" ? (rotated ? 2 : 4) : rotated ? 1 : ship.length;
  const height =
    ship.id === "cv" ? (rotated ? 4 : 2) : rotated ? ship.length : 1;
  if (x + width > BOARD_SIZE || y + height > BOARD_SIZE) return [];

  return Array.from({ length: width * height }, (_, index) => {
    const cellX = x + (index % width);
    const cellY = y + Math.floor(index / width);
    return cellAt(cellX, cellY);
  });
}

export function getAttackPattern(pattern: string, anchor: number) {
  const [x, y] = coordinates(anchor);
  const result: number[] = [];
  const add = (dx: number, dy: number) => {
    if (
      x + dx >= 0 &&
      x + dx < BOARD_SIZE &&
      y + dy >= 0 &&
      y + dy < BOARD_SIZE
    ) {
      result.push(cellAt(x + dx, y + dy));
    }
  };

  if (pattern === "tomcat") return [anchor];
  if (pattern === "column") {
    return Array.from({ length: BOARD_SIZE }, (_, row) =>
      cellAt(x, row),
    );
  }
  if (pattern.startsWith("pick")) {
    const count = Number(pattern.slice(4));
    return Array.from(
      { length: count },
      () => Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE),
    );
  }

  const size: Record<string, number> = {
    area3: 3,
    area2: 2,
    corners4: 4,
    corners5: 5,
    ring: 3,
    row3: 3,
    row4: 4,
    col4: 4,
    radar: 2,
    sps5: 5,
    sparse: 5,
  };
  const n = size[pattern] ?? 1;
  if (!isRadar(pattern) && (x + n > BOARD_SIZE || y + n > BOARD_SIZE)) {
    return [];
  }

  if (pattern.startsWith("area")) {
    for (let row = 0; row < n; row++) {
      for (let column = 0; column < n; column++) add(column, row);
    }
  }
  if (pattern.startsWith("corners")) {
    [
      [0, 0],
      [n - 1, 0],
      [0, n - 1],
      [n - 1, n - 1],
    ].forEach(([column, row]) => add(column, row));
    if (pattern === "corners5") add(2, 2);
  }
  if (pattern === "ring") {
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        if (column !== 1 || row !== 1) add(column, row);
      }
    }
  }
  if (pattern === "row3" || pattern === "row4") {
    for (let column = 0; column < n; column++) add(column, 0);
  }
  if (pattern === "col4") {
    for (let row = 0; row < n; row++) add(0, row);
  }
  if (pattern === "radar") {
    for (let row = 0; row < 2; row++) {
      for (let column = 0; column < 2; column++) add(column, row);
    }
  }
  if (pattern === "radar5") {
    for (let row = -2; row <= 2; row++) {
      for (let column = -2; column <= 2; column++) {
        if (Math.abs(column) + Math.abs(row) <= 2) add(column, row);
      }
    }
  }
  if (pattern === "sps5") {
    [[2, 2], [0, 0], [4, 0], [0, 4], [4, 4]].forEach(([column, row]) =>
      add(column, row),
    );
  }
  if (pattern === "sparse") {
    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 5; column++) {
        if (
          ![1, 3].includes(column) &&
          ![1, 3].includes(row) &&
          !(column === 2 && row === 2)
        ) {
          add(column, row);
        }
      }
    }
  }
  return [...new Set(result)];
}

export function getAttackPreviewPattern(pattern: string, anchor: number) {
  return pattern.startsWith("pick")
    ? [anchor]
    : getAttackPattern(pattern, anchor);
}

function appendLog(
  state: GameState,
  key: string,
  ...values: (string | number)[]
) {
  state.log.push({ key, values });
}

export function deployShip(
  current: GameState,
  shipId: string,
  anchor: number,
  rotated: boolean,
) {
  const ship = FLEET.find((entry) => entry.id === shipId);
  if (!ship || current.phase !== "setup" || current.placed[shipId]) {
    return current;
  }
  const cells = getShipLayout(ship, anchor, rotated);
  if (
    cells.length !== ship.length ||
    Object.values(current.placed).some((placed) =>
      placed.cells.some((cell) => cells.includes(cell)),
    )
  ) {
    const next = { ...current, log: [...current.log] };
    appendLog(next, "invalid");
    return next;
  }

  return {
    ...current,
    placed: {
      ...current.placed,
      [shipId]: { shipId, cells, hp: cells.length, sunk: false },
    },
  };
}

function randomFleet(): PlacedShip[] {
  const placed: PlacedShip[] = [];
  for (const ship of FLEET) {
    let cells: number[] = [];
    for (let attempt = 0; attempt < 1000; attempt++) {
      cells = getShipLayout(
        ship,
        Math.floor(Math.random() * BOARD_SIZE * BOARD_SIZE),
        Math.random() < 0.5,
      );
      if (
        cells.length === ship.length &&
        !placed.some((other) =>
          other.cells.some((cell) => cells.includes(cell)),
        )
      ) {
        break;
      }
      cells = [];
    }
    if (cells.length !== ship.length) {
      throw new Error(`Unable to place enemy ${ship.name}.`);
    }
    placed.push({ shipId: ship.id, cells, hp: cells.length, sunk: false });
  }
  return placed;
}

export function beginBattle(current: GameState) {
  if (
    current.phase !== "setup" ||
    Object.keys(current.placed).length !== FLEET.length
  ) {
    return current;
  }
  const next = {
    ...current,
    phase: "battle" as const,
    enemyFleet: randomFleet(),
    log: [...current.log],
    statusKey: "yourTurn",
  };
  appendLog(next, "detected");
  return next;
}

export function fireAt(
  current: GameState,
  anchor: number,
  weaponValue: string,
) {
  if (current.phase !== "battle") return current;
  const next: GameState = {
    ...current,
    placed: { ...current.placed },
    enemyFleet: current.enemyFleet.map((ship) => ({
      ...ship,
      cells: [...ship.cells],
    })),
    shots: [...current.shots],
    hits: [...current.hits],
    misses: [...current.misses],
    incoming: [...current.incoming],
    incomingHits: [...current.incomingHits],
    incomingMisses: [...current.incomingMisses],
    nearMisses: [...current.nearMisses],
    sunkEnemyCells: [...current.sunkEnemyCells],
    sunkPlayerCells: [...current.sunkPlayerCells],
    radarDetected: [...current.radarDetected],
    radarClear: [...current.radarClear],
    log: [...current.log],
  };
  let weaponPattern = "normal";
  let cost = 0;
  if (weaponValue !== "normal") {
    const [selectedShipId, equipmentIndex] = weaponValue.split(":");
    const selectedShip = FLEET.find((ship) => ship.id === selectedShipId);
    const equipment = selectedShip?.equipment[Number(equipmentIndex)];
    if (!selectedShip || !equipment || current.placed[selectedShipId]?.sunk) {
      return current;
    }
    weaponPattern = equipment.pattern;
    cost = equipment.cost;
  }
  if (current.creditsUsed + cost > EQUIPMENT_BUDGET) return current;
  next.creditsUsed += cost;

  const targets =
    weaponPattern === "normal" ? [anchor] : getAttackPattern(weaponPattern, anchor);
  if (isRadar(weaponPattern)) {
    next.radarDetected = [];
    next.radarClear = [];
    for (const cell of targets) {
      if (
        next.enemyFleet.some((ship) => !ship.sunk && ship.cells.includes(cell))
      ) {
        next.radarDetected.push(cell);
      } else {
        next.radarClear.push(cell);
      }
    }
    appendLog(next, "radarResult", next.radarDetected.length, next.radarClear.length);
    return next;
  }

  next.radarDetected = [];
  next.radarClear = [];
  let hitCount = 0;
  for (const cell of targets) {
    if (next.shots.includes(cell)) continue;
    next.shots.push(cell);
    const target = next.enemyFleet.find(
      (ship) => !ship.sunk && ship.cells.includes(cell),
    );
    if (!target) {
      next.misses.push(cell);
      continue;
    }
    hitCount++;
    next.hits.push(cell);
    if (weaponPattern === "tomcat" || target.cells.every((shot) => next.shots.includes(shot))) {
      target.sunk = true;
      next.sunkEnemyCells.push(...target.cells);
      appendLog(
        next,
        weaponPattern === "tomcat" ? "tomcatSunk" : "enemySunk",
        target.shipId,
      );
    }
  }
  appendLog(next, "strikeResult", hitCount, targets.length - hitCount);
  next.nearMisses = next.misses.filter((cell) => {
    const [x, y] = coordinates(cell);
    return next.enemyFleet.some(
      (ship) =>
        !ship.sunk &&
        ship.cells.some((segment) => {
          const [sx, sy] = coordinates(segment);
          return (
            Math.abs(x - sx) <= 1 &&
            Math.abs(y - sy) <= 1 &&
            (x !== sx || y !== sy)
          );
        }),
    );
  });

  if (next.enemyFleet.every((ship) => ship.sunk)) {
    next.phase = "over";
    next.statusKey = "victory";
    return next;
  }

  const availableTargets = boardCells.filter(
    (cell) => !next.incoming.includes(cell),
  );
  if (availableTargets.length === 0) return next;
  const incomingCell =
    availableTargets[Math.floor(Math.random() * availableTargets.length)];
  next.incoming.push(incomingCell);
  const playerShip = Object.values(next.placed).find(
    (ship) => !ship.sunk && ship.cells.includes(incomingCell),
  );
  if (playerShip) {
    next.incomingHits.push(incomingCell);
    playerShip.hp--;
    if (playerShip.hp <= 0) {
      playerShip.sunk = true;
      next.sunkPlayerCells.push(...playerShip.cells);
      appendLog(next, "shipSunk", playerShip.shipId);
    }
    appendLog(next, "enemyHit");
  } else {
    next.incomingMisses.push(incomingCell);
    appendLog(next, "enemyMiss");
  }
  const coordinate = `${String.fromCharCode(65 + (incomingCell % BOARD_SIZE))}${1 + Math.floor(incomingCell / BOARD_SIZE)}`;
  appendLog(next, "enemyFireAt", coordinate);
  return next;
}

export function clearFleet() {
  return createGame();
}

export function getShipAtCell(ships: PlacedShip[], cell: number) {
  return ships.find((ship) => ship.cells.includes(cell));
}

export function getRemainingBudget(state: GameState) {
  return EQUIPMENT_BUDGET - state.creditsUsed;
}
