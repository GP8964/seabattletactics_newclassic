import type { Route } from "./+types/home";
import { SeaBattleGame } from "../components/game/SeaBattleGame";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sea Battle Tactics" },
    {
      name: "description",
      content: "Single-player naval strategy game prototype.",
    },
  ];
}

export default function Home() {
  return <SeaBattleGame />;
}
