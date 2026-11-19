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

  function finishGame(time, rank) {
    function showRecords(records, rank, newRecord) {
      // If the player plays subsequent rounds, remove old "new" records.
      const recordList = records.flat().map((record) => ({
        ...record,
        new: false,
      }));

      // If the player ranked in the top 10, add the record to the list
      if (rank <= 10) {
        recordList.splice(rank - 1, 0, newRecord);
      }

      // If there are empty records, add a placeholder
      while (recordList.length < 10) {
        recordList.push({ userName: "--", time: "--" });
      }

      return recordList.slice(0, 10);
    }

    // Show the records including the players new record
    const recordList = showRecords(gameData.image.records, rank, {
      userName: gameData.userName,
      time: time,
      new: true,
    });

    // Update game records
    setGameData((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        records: recordList,
      },
      time,
      rank,
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
    finished: (
      <Finished
        gameData={gameData}
        resetGame={resetGame}
        restartGame={() => startGame(gameData.image, gameData.userName)}
      />
    ),
  };

  return (
    <>
      {/* Load 3 different components depending on setup, started or finished */}
      {content[gameState]}
    </>
  );
}

export default App;
