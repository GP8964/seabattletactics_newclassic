export type Language = "en" | "jp";

export type Equipment = {
  name: string;
  jpName: string;
  cost: number;
  pattern: string;
};

export type FleetShip = {
  id: string;
  name: string;
  jpName: string;
  length: number;
  equipment: Equipment[];
};

export const FLEET: FleetShip[] = [
  {
    id: "cv",
    name: "Aircraft Carrier",
    jpName: "空母",
    length: 8,
    equipment: [
      { name: "Harrier", jpName: "ハリアー", cost: 10, pattern: "pick4" },
      { name: "Hornet", jpName: "ホーネット", cost: 18, pattern: "area3" },
      { name: "Tomcat", jpName: "トムキャット", cost: 20, pattern: "tomcat" },
    ],
  },
  {
    id: "bb",
    name: "Battleship",
    jpName: "戦艦",
    length: 5,
    equipment: [
      { name: "Main Cannon", jpName: "主砲", cost: 6, pattern: "area2" },
      { name: "Tomahawk Z", jpName: "トマホークZ", cost: 15, pattern: "column" },
      { name: "Triple Shot", jpName: "三連射", cost: 20, pattern: "sparse" },
    ],
  },
  {
    id: "ca",
    name: "Cruiser",
    jpName: "巡洋艦",
    length: 4,
    equipment: [
      { name: "Phalanx", jpName: "ファランクス", cost: 4, pattern: "corners4" },
      { name: "Sea Sparrow", jpName: "シースパロー", cost: 6, pattern: "corners5" },
      { name: "Tomahawk", jpName: "トマホーク", cost: 10, pattern: "ring" },
    ],
  },
  {
    id: "dd",
    name: "Destroyer",
    jpName: "駆逐艦",
    length: 3,
    equipment: [
      { name: "SS-N-25", jpName: "SS-N-25", cost: 3, pattern: "row3" },
      { name: "Harpoon", jpName: "ハープーン", cost: 4, pattern: "row4" },
      { name: "Stealth", jpName: "ステルス", cost: 4, pattern: "col4" },
    ],
  },
  {
    id: "ss",
    name: "Submarine",
    jpName: "潜水艦",
    length: 2,
    equipment: [
      { name: "Twin Torpedoes", jpName: "2連装魚雷", cost: 2, pattern: "pick2" },
      { name: "Triple Torpedoes", jpName: "3連装魚雷", cost: 3, pattern: "pick3" },
      { name: "Quad Torpedoes", jpName: "4連装魚雷", cost: 4, pattern: "pick4" },
    ],
  },
  {
    id: "re",
    name: "Recon ship",
    jpName: "偵察艦",
    length: 1,
    equipment: [
      { name: "SPS-4", jpName: "SPS-4レーダー", cost: 1, pattern: "radar" },
      { name: "SPS-5", jpName: "SPS-5レーダー", cost: 2, pattern: "sps5" },
      { name: "SPS-8", jpName: "SPS-8レーダー", cost: 4, pattern: "radar5" },
    ],
  },
];

export const BOARD_SIZE = 8;
export const EQUIPMENT_BUDGET = 60;

export function shipName(shipId: string, language: Language) {
  const ship = FLEET.find((entry) => entry.id === shipId);
  return language === "jp" ? ship?.jpName ?? shipId : ship?.name ?? shipId;
}

export function equipmentName(equipment: Equipment, language: Language) {
  return language === "jp" ? equipment.jpName : equipment.name;
}
