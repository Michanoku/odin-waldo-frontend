import { useEffect, useState } from "react";
import GameBoard from "./started/GameBoard.jsx";
import SidePanel from "./started/SidePanel.jsx";
import Toast from "./started/Toast.jsx";
import { startGame, tagCharacter } from "../api/api.js";
import urls from "../api/urls.js";
import "../styles/started/started.css";

// Started function for the game
export default function Started({ setGameState, gameData }) {
  // This saves the character data from the server (no locations included)
  const [characters, setCharacters] = useState([]);
  // The gameboard image
  const [image, setImage] = useState(null);
  // The coordinates the player has clicked on
  const [coordinates, setCoordinates] = useState(null);
  // Toast announcing correct or incorrect tag
  const [toast, setToast] = useState(null);

  function quit() {
    localStorage.removeItem("token");
    setGameState("setup");
  }

  async function handleCharacterTag(id) {
    try {
      // Send tag to API and get the response
      const response = await tagCharacter(coordinates.x, coordinates.y, id);
      if (response.message === "gameover") {
        // TODO: replace this toast with endgame handling
        setToast({ message: "You won the game!", type: "end" });
      } else if (response.message === "correct") {
        // Find the found character by its id and add the Found bool so it can be checked off
        setCharacters((prevCharacters) =>
          prevCharacters.map((character) =>
            character.id === id ? { ...character, found: true } : character,
          ),
        );
        // Inform user of the success
        setToast({ message: "Character found!", type: "success" });
      } else {
        // Inform the user of the failure
        setToast({ message: "Not here!", type: "failure" });
      }
    } catch (error) {
      console.error("Character tagging failed:", error);
      setToast({ message: "Something went wrong!", type: "failure" });
    } finally {
      setCoordinates(null);
    }
  }

  // This function is used to load the game image so the game can start when everything is loaded
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));

      img.src = url;
    });
  }

  // Set the image and load the game data to start
  useEffect(() => {
    // Initialize the game
    async function initGame() {
      try {
        // Set the image and username data
        const image = gameData.image;
        const userName = gameData.userName;
        // Create the imageurl and load the image (so the timer doesn't start before that)
        const imageUrl = `${urls.backend}${image.imageUrl}`;
        const loadedImage = await loadImage(imageUrl);
        setImage(loadedImage);
        // Ask the server to start the game via the API
        const response = await startGame(image.id, userName);
        // Set the gametoken received
        localStorage.setItem("token", response.token);
        // Set the characters received
        setCharacters(response.characters);
      } catch (error) {
        console.error("Game initialization failed:", error);
      }
    }

    initGame();
  }, [gameData]);

  return (
    <main className="mainStarted">
      <GameBoard
        image={image}
        characters={characters}
        setCoordinates={setCoordinates}
        handleCharacterTag={handleCharacterTag}
      />
      <SidePanel characters={characters} quit={quit} />
      {toast && <Toast toast={toast} setToast={setToast} />}
    </main>
  );
}
