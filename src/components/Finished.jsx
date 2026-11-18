import "../styles/finished/finished.css";
import { RotateCcw, LogOut } from "lucide-react";


export default function Finished({ gameData, resetGame, restartGame }) {
function showRecords(records, rank, newRecord) {
    const recordList = records.flat();

    if (rank <= 10) {
        recordList.splice(rank - 1, 0, newRecord);
    }

    while (recordList.length < 10) {
        recordList.push({ userName: "--", time: "--" });
    }

    return recordList.slice(0, 10);
}

const recordList = showRecords(
    gameData.image.records,
    gameData.rank,
    { userName: gameData.userName, time: gameData.time, new: true }
);

    // Show the user a congratulations screen and show time. 

    // Check if the user ranked in.
    // If the user ranked in, show his time in a different style from the other times in the list and hint at the rank in
    // If the user did not rank in, just show the current list. 
    // Offer try again or back to stage select
    return (
        <main className="mainFinished responsivePadding">
            <div className="finishedText">
                <div>Congratulations! You found all characters.</div>
                <div className="finishedTime">{`Time ${gameData.time}`}</div>
                <div>{`Rank ${gameData.rank}`}</div>
            </div>
        <div className="imageRecords finishedRecords">
          {recordList.map((record, index) => (
            <div className={`recordEntry ${record.new ? "newRecord" : ""}`} key={index}>
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
    )
}