import { useLayoutEffect, useRef, useState } from "react";
import "../../styles/started/gameboard.css";

// Target circle to select character
function Target({ popupVisible, popupPosition }) {
  return (
    <div
      className={`target${popupVisible ? " visible" : ""}`}
      style={{
        left: popupPosition.x,
        top: popupPosition.y,
      }}
    ></div>
  );
}

// The button with the character name to select from the menu
function CharacterButton({ character, onClick }) {
  return (
    <button
      className="characterButton"
      onClick={() => onClick(character.id)}
      key={character.id}
    >
      {character.name}
    </button>
  );
}

// Character select menu to choose a name after clicking a character
function CharacterSelect({
  popupVisible,
  popupPosition,
  popupRef,
  characters,
  handleCharacterSelect,
}) {
  return (
    <div
      ref={popupRef}
      className={`popup${popupVisible ? " visible" : ""}`}
      style={{
        left: popupPosition.menuX ?? 0,
        top: popupPosition.menuY ?? 0,
      }}
    >
      {characters.map(
        (character) =>
          !character.found && (
            <CharacterButton
              key={character.id}
              character={character}
              onClick={handleCharacterSelect}
            />
          ),
      )}
    </div>
  );
}

// The popup to select a character and name
function Popup({
  popupPosition,
  popupVisible,
  popupRef,
  characters,
  handleCharacterSelect,
}) {
  return (
    <>
      <Target popupVisible={popupVisible} popupPosition={popupPosition} />
      <CharacterSelect
        popupVisible={popupVisible}
        popupPosition={popupPosition}
        popupRef={popupRef}
        characters={characters}
        handleCharacterSelect={handleCharacterSelect}
      />
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
  // References to the board and the popup menu for character selection
  const boardRef = useRef(null);
  const popupRef = useRef(null);

  // Save visibility and position of the popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState(null);

  // Calculate the best position for the popup to avoid edges
  useLayoutEffect(() => {
    if (!popupPosition || !boardRef.current || !popupRef.current) return;

    // Get the current references
    const board = boardRef.current;
    const popup = popupRef.current;

    // Visible area of the scrollable game board
    const bounds = {
      left: board.scrollLeft,
      top: board.scrollTop,
      right: board.scrollLeft + board.clientWidth,
      bottom: board.scrollTop + board.clientHeight,
    };

    // Actual popup dimensions
    const width = popup.offsetWidth;
    const height = popup.offsetHeight;

    const targetX = popupPosition.x;
    const targetY = popupPosition.y;

    // Half of the target circle diameter
    const radius = 35;
    // Space between circle and popup (1rem)
    const gap = 16;

    // Inintialize the best position and minOverflow.
    let bestPosition = null;
    // Infinity is used here because the first calculated overflow will be at least smaller than that
    let minOverflow = Infinity;

    // Try 16 different directions around the target (a circle around the target circle)
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Distance from target to popup (centers)
      const distance =
        radius +
        gap +
        (Math.abs(cos) * width) / 2 +
        (Math.abs(sin) * height) / 2;

      const centerX = targetX + cos * distance;
      const centerY = targetY + sin * distance;

      const left = centerX - width / 2;
      const top = centerY - height / 2;
      const right = left + width;
      const bottom = top + height;

      // Overflow shows how far the popup would extend beyond each edge
      const overflow =
        Math.max(0, bounds.left - left) +
        Math.max(0, bounds.top - top) +
        Math.max(0, right - bounds.right) +
        Math.max(0, bottom - bounds.bottom);

      // See which positions fit, then the ones with the least overflow
      if (overflow < minOverflow) {
        minOverflow = overflow;
        bestPosition = { x: left, y: top };
      }
    }

    if (bestPosition) {
      setPopupPosition((current) => ({
        ...current,
        menuX: bestPosition.x,
        menuY: bestPosition.y,
      }));

      requestAnimationFrame(() => {
        setPopupVisible(true);
      });
    }
  }, [popupPosition?.x, popupPosition?.y]);

  function handleClick(event) {
    const imageElement = event.currentTarget;

    const originalWidth = imageElement.naturalWidth;
    const originalHeight = imageElement.naturalHeight;

    const displayedWidth = imageElement.clientWidth;
    const displayedHeight = imageElement.clientHeight;

    // Click position relative to the image
    const rect = imageElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert to original image coordinates for the server
    const originalX = clickX * (originalWidth / displayedWidth);
    const originalY = clickY * (originalHeight / displayedHeight);

    setPopupVisible(false);

    // Reset menu coordinates
    setPopupPosition({
      x: clickX,
      y: clickY,
      menuX: null,
      menuY: null,
    });

    setCoordinates({ x: originalX, y: originalY });
  }

  async function handleCharacterSelect(id) {
    setPopupVisible(false);
    await handleCharacterTag(id);
  }

  return (
    <div className="gameBoard" ref={boardRef}>
      {popupPosition && (
        <Popup
          popupVisible={popupVisible}
          popupPosition={popupPosition}
          popupRef={popupRef}
          characters={characters}
          handleCharacterSelect={handleCharacterSelect}
        />
      )}

      <GameImage image={image} handleClick={handleClick} />
    </div>
  );
}
