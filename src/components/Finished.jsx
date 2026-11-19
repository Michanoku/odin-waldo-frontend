import "../styles/finished/finished.css";
import { RotateCcw, LogOut } from "lucide-react";

// The text results showing the user how they did
function TextResults({ time, rank }) {
  return (
    <div className="finishedText">
      <div>Congratulations! You found all characters.</div>
      <div className="finishedTime">{`Time ${time}`}</div>
      <div>{`Rank ${rank}`}</div>
    </div>
  );
}

// The top 10 records including the current user attempt
function RecordsList({ records }) {
  return (
    <div className="imageRecords finishedRecords">
      {records.map((record, index) => (
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
  );
}

function SelectButtons({ restartGame, resetGame }) {
  return (
    <div className="selectButtons">
      <button className="selectButton" onClick={restartGame}>
        <RotateCcw size={64} />
      </button>
      <button className="selectButton" onClick={resetGame}>
        <LogOut size={64} />
      </button>
    </div>
  );
}

// The finished screen after the user is done playing
export default function Finished({ gameData, resetGame, restartGame }) {
  // Show the user a congratulations screen and show time.
  return (
    <main className="mainFinished responsivePadding">
      <TextResults time={gameData.time} rank={gameData.rank} />
      <RecordsList records={gameData.image.records} />
      <SelectButtons resetGame={resetGame} restartGame={restartGame} />
    </main>
  );
}
