import "../styles/finished/finished.css";
import { RotateCcw, LogOut } from "lucide-react";

export default function Finished({ gameData, resetGame, restartGame }) {
  // Show the user a congratulations screen and show time.
  return (
    <main className="mainFinished responsivePadding">
      <div className="finishedText">
        <div>Congratulations! You found all characters.</div>
        <div className="finishedTime">{`Time ${gameData.time}`}</div>
        <div>{`Rank ${gameData.rank}`}</div>
      </div>
      <div className="imageRecords finishedRecords">
        {gameData.image.records.map((record, index) => (
          <div
            className={`recordEntry ${record.new ? "newRecord" : ""}`}
            key={index}
          >
            <span>{index + 1}.</span>
            <span>{record.time}</span>
            <span>{record.userName}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="selectButtons">
          <button className="selectButton" onClick={restartGame}>
            <RotateCcw size={64} />
          </button>
          <button className="selectButton" onClick={resetGame}>
            <LogOut size={64} />
          </button>
        </div>
      </div>
    </main>
  );
}
