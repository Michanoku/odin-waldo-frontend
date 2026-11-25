import { Check, LogOut, Menu, X } from "lucide-react";
import urls from "../../api/urls.js";
import "../../styles/started/sidepanel.css";

// The image of a character in the sidepanel, used to find characters
function CharacterImage({ character }) {
  return (
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
  );
}

// The button to quit the game
function QuitButton({ resetGame }) {
  return (
    <button className="quitButton" onClick={resetGame}>
      <LogOut size={64} />
    </button>
  );
}

export function OpenButton({ toggleSidepanel, panelVisible }) {
  const buttonIcon = panelVisible ? <X size={32} /> : <Menu size={32} />;
  return (
    <button className="openButton" onClick={toggleSidepanel}>
      {buttonIcon}
    </button>
  );
}

// The side panel with character images and quit button
export function SidePanel({ characters, resetGame, panelVisible }) {
  return (
    <div className={`sidePanel ${panelVisible ? "open" : ""}`}>
      <div className="characterList">
        {characters.map((character) => (
          <CharacterImage character={character} key={character.id} />
        ))}
      </div>
      <QuitButton resetGame={resetGame} />
    </div>
  );
}
