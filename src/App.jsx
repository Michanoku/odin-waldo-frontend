import { useState } from "react";
import Setup from "./components/Setup.jsx";
import Started from "./components/Started.jsx";
import Finished from "./components/Finished.jsx";
import "./styles/index.css";

function App() {
  // The game has three states, setup, started, finished
  const [ gameState, setGameState ] = useState("setup")

  const content = {
    setup: <Setup setGameState={setGameState} />,
    started: <Started setGameState={setGameState} />,
    finished: <Finished setGameState={setGameState} />,
  }

  return (
    <>
        { /* Load 3 different components depending on setup, started or finished */}        
        {content[gameState]}
    </>
  )
}

export default App
