import { useState } from "react";
import "../styles/gameboard.css";

// The popup to select a character and name
function Popup({
  popupPosition,
  popupVisible,
  characters,
  handleCharacterSelect,
}) {
  return (
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
                onClick={() => handleCharacterSelect(character.id)}
                key={character.id}
              >
                {character.name}
              </button>
            ),
        )}
      </div>
    </>
  );
}

// The image where the characters are hidden
function GameImage({ image, handleClick }) {
  return (
    <img
      className="gameImage"
      src={image ? image.src : null}
      onClick={handleClick}
    ></img>
  );
}

// The gameboard handling both the popup and the image
export default function GameBoard({
  image,
  characters,
  setCoordinates,
  handleCharacterTag,
}) {
  // Popup data, visible or not, position
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);

  // Move the popup on player click, check location and show appropriately
  function movePopup(x, y, closeToRight, closeToBottom, closeToTop) {
    setPopupVisible(false);
    setPopupPosition({ x, y, closeToRight, closeToBottom, closeToTop });
    // Wait till the animation is done to show the next one
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPopupVisible(true);
      });
    });
  }

  // Handles clicks on the game image
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

    // Move the popup to the current location and set the coordinates
    movePopup(clickX, clickY, closeToRight, closeToBottom, closeToTop);
    setCoordinates({ x: originalX, y: originalY });
  }

  // Character select is just a short helper function connecting to the parent function
  async function handleCharacterSelect(id) {
    setPopupVisible(false);
    await handleCharacterTag(id);
  }

  return (
    <div className="gameBoard">
      {popupPosition && (
        <Popup
          popupVisible={popupVisible}
          popupPosition={popupPosition}
          characters={characters}
          handleCharacterSelect={handleCharacterSelect}
        />
      )}
      <GameImage image={image} handleClick={handleClick} />
    </div>
  );
}
