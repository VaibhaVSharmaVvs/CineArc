import React from "react";
import GameSetup from "@/components/GameSetup";
import GamePlay from "@/components/GamePlay";
import GameOver from "@/components/GameOver";
import { GameProvider, useGame } from "@/context/GameContext";

const GameRouter: React.FC = () => {
  const { state } = useGame();

  return (
    <div className="min-h-screen bg-background">
      {state.phase === "setup" && <GameSetup />}
      {(state.phase === "playing" || state.phase === "reveal") && <GamePlay />}
      {state.phase === "gameover" && <GameOver />}
    </div>
  );
};

const Index: React.FC = () => (
  <GameProvider>
    <GameRouter />
  </GameProvider>
);

export default Index;
