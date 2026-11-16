import { useState } from "react";
import Setup from "./components/Setup.jsx";
import Started from "./components/Started.jsx";
import Finished from "./components/Finished.jsx";
import "./styles/index.css";

function App() {
  // The game has three states, setup, started, finished
  const [gameState, setGameState] = useState("setup");
  const [gameData, setGameData] = useState(null);

  function startGame(image, userName) {
    setGameData({ image, userName });
    setGameState("started");
  }

  function finishGame(time) {
    setGameData((prev) => ({
      ...prev,
      time,
    }));
    localStorage.removeItem("token");
    setGameState("finished");
  }

  function resetGame() {
    setGameData(null);
    localStorage.removeItem("token");
    setGameState("setup");
  }

  const content = {
    setup: <Setup startGame={startGame} />,
    started: (
      <Started
        gameData={gameData}
        resetGame={resetGame}
        finishGame={finishGame}
      />
    ),
    finished: <Finished gameData={gameData} resetGame={resetGame} />,
  };

  return (
    <>
      {/* Load 3 different components depending on setup, started or finished */}
      {content[gameState]}
    </>
  );
}

export default App;
