import { Check } from "lucide-react";
import urls from "../../api/urls.js";
import "../../styles/started/sidepanel.css";

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

function QuitButton({ quit }) {
  return (
    <button className="quitButton" onClick={quit}>
      Quit
    </button>
  );
}

export default function SidePanel({ characters, quit }) {
  return (
    <div className="sidePanel">
      <div className="characterList">
        {characters.map((character) => (
          <CharacterImage character={character} key={character.id} />
        ))}
      </div>
      <QuitButton quit={quit} />
    </div>
  );
}
