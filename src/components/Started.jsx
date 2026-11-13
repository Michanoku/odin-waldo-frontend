import { useEffect, useState } from "react";
import { startGame, tagCharacter } from "../api/api.js";
import { Check } from "lucide-react";
import urls from "../api/urls.js";
import "../styles/started.css";

// Started function for the game
export default function Started({ setGameState, gameData }) {
  // This saves the character data from the server (no locations included)
  const [characters, setCharacters] = useState([]);
  // The gameboard image
  const [image, setImage] = useState(null);
  // Popup data, visible or not, position
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);
  // The coordinates the player has clicked on
  const [coordinates, setCoordinates] = useState(null);
  // Toast announcing correct or incorrect tag
  const [toast, setToast] = useState(null)

  function movePopup(x, y, closeToRight, closeToBottom, closeToTop) {
    setPopupVisible(false);
    setPopupPosition({ x, y, closeToRight, closeToBottom, closeToTop });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPopupVisible(true);
      });
    });
  }

  async function handleCharacterTag(id) {
    console.log(
      "Tagged character",
      id,
      "in location X:",
      coordinates.x,
      "Y:",
      coordinates.y,
    );
    // Hide the popup
    setPopupVisible(false);
    // Send tag to API and get the response
    const response = await tagCharacter(coordinates.x, coordinates.y, id);
    if (response.message === "gameover") {
      // TODO: replace this toast with endgame handling
      setToast({message: "You won the game!", type: "end"});
    } else if (response.message === "correct") {
      // Find the found character by its id and add the Found bool so it can be checked off
      setCharacters((prevCharacters) =>
        prevCharacters.map((character) =>
          character.id === id ? { ...character, found: true } : character,
        ),
      );
      // Inform user of the success
      setToast({message: "Character found!", type: "success"});
    } else {
      // Inform the user of the failure
      setToast({message: "Not here!", type: "failure"});
    }
    setCoordinates(null);
  }

  function handleClick(event) {
    const image = event.currentTarget;
    // Save the original image dimensions
    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;

    // Save the displayed image dimensions
    const displayedWidth = image.clientWidth;
    const displayedHeight = image.clientHeight;

    // Get the click position relative to the displayed image
    const rect = image.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert position to the original image dimension
    const originalX = clickX * (originalWidth / displayedWidth);
    const originalY = clickY * (originalHeight / displayedHeight);

    // Check if we are close to the border
    const spaceRight = displayedWidth - clickX;
    const spaceBottom = displayedHeight - clickY;

    const closeToRight = spaceRight < 200;
    const closeToBottom = spaceBottom < 150;
    const closeToTop = clickY < 150;

    movePopup(clickX, clickY, closeToRight, closeToBottom, closeToTop);
    setCoordinates({ x: originalX, y: originalY });
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
      {popupPosition && (
        <>
          <div
            className={`target${popupVisible ? " visible" : ""}`}
            style={{
              left: popupPosition.x,
              top: popupPosition.y,
            }}
          ></div>
          <div
            className={`popup${popupVisible ? " visible" : ""}`}
            style={{
              left: popupPosition.x,
              top: popupPosition.y,
              transform: `translate(
            ${popupPosition.closeToRight ? "-130%" : "30%"},
              ${
                popupPosition.closeToBottom
                  ? "-130%"
                  : popupPosition.closeToTop
                    ? "30%"
                    : "-50%"
              }
          )`,
            }}
          >
            {characters.map(
              (character) =>
                !character.found && (
                  <button
                    className="characterButton"
                    onClick={async () => await handleCharacterTag(character.id)}
                    key={character.id}
                  >
                    {character.name}
                  </button>
                ),
            )}
          </div>
        </>
      )}

      <div className="gameBoard">
        <img
          className="gameImage"
          src={image ? image.src : null}
          onClick={handleClick}
        ></img>
      </div>
      <div className="sidePanel">
        <div className="characterList">
          {characters.map((character) => (
            <div className="characterImage" key={character.id}>
              <div className="checkOverlay">
                <img
                  className={character.found && "found"}
                  src={`${urls.backend}${character.imageUrl}`}
                />
                {character.found && <Check />}
              </div>
              <div>{character.name}</div>
            </div>
          ))}
        </div>
        <button className="quitButton">Quit</button>
      </div>
      {toast &&
      <div className={`toast ${toast.type}`}>{toast.message}</div>
      }
    </main>
  );
}
