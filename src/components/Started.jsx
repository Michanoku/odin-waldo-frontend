import { useEffect, useState } from "react";
import { startGame } from "../api/api.js";
import { Check } from "lucide-react";
import urls from "../api/urls.js";
import "../styles/started.css";

export default function Started({ setGameState, gameData }) {
  const [characters, setCharacters] = useState([]);
  const [image, setImage] = useState(null);

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
      <div className="gameBoard">
        <img className="gameImage" src={image ? image.src : null}></img>
      </div>
      <div className="sidePanel">
        <div className="characterList">
          {characters.map((character) => (
            <div className="characterImage" key={character.id}>
              <div className="checkOverlay">
                <img className={character.found && "found"} src={`${urls.backend}${character.imageUrl}`} />
                {character.found && <Check />}
              </div>
              <div>{character.name}</div>
            </div>
          ))}
        </div>
        <button className="quitButton">Quit</button>
      </div>
    </main>
  );
}
