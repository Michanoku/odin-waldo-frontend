import { useEffect, useState, useRef } from "react";
import { getImageData } from "../api/api.js";
import { Undo2, Play } from "lucide-react";
import ImageList from "./setup/ImageList.jsx";
import urls from "../api/urls.js";
import "../styles/setup/setup.css";

function ImageSelect({
  userName,
  setUserName,
  setSelected,
  imageData,
  setImageData,
  images,
  setImages,
  selectedImage,
  setSelectedImage,
}) {
  const nameInputRef = useRef(null);

  function selectImage(image) {
    if (!nameInputRef.current.checkValidity()) {
      return window.alert("Please enter a name between 3 and 32 characters.");
    }
    return setSelected(image);
  }

  return (
    <>
      <div className="mainTitle">Character Search</div>
      <ImageList
        selectImage={selectImage}
        imageData={imageData}
        setImageData={setImageData}
        images={images}
        setImages={setImages}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
      <div className="center">
        <div className="inputGroup">
          <label htmlFor="nameInput">Player Name</label>
          <input
            className="nameInput"
            ref={nameInputRef}
            id="nameInput"
            type="text"
            defaultValue={userName}
            onChange={(event) => {
              setUserName(event.target.value);
              localStorage.setItem("userName", event.target.value);
            }}
            minLength={3}
            maxLength={32}
            required
          />
        </div>
      </div>
    </>
  );
}

function SelectedImage({ selected, setSelected, play }) {
  function showRecords(records) {
    const recordList = records.flat();
    while (recordList.length < 10) {
      recordList.push({ userName: "--", time: "--" });
    }

    return recordList;
  }
  const recordList = showRecords(selected.records);
  return (
    <>
      <div className="mainTitle">{selected.name}</div>
      <div className="imageInfo">
        <div className="imageContainer">
          <div className="imagePreview">
            <img
              src={`${urls.backend}${selected.thumbUrl}`}
              width={300}
              height={200}
              alt={selected.name}
            />
          </div>
        </div>
        <div className="imageRecords">
          <div className="center">Top 10</div>
          {recordList.map((record, index) => (
            <div className="recordEntry" key={index}>
              <span>{index + 1}.</span>
              <span>{record.time}</span>
              <span>{record.userName}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="selectButtons">
        <button className="selectButton" onClick={() => setSelected(null)}>
          <Undo2 size={64} />
        </button>
        <button className="selectButton" onClick={() => play(selected)}>
          <Play size={64} />
        </button>
      </div>
    </>
  );
}

export default function Setup({ startGame }) {
  // The data for all available images
  const [imageData, setImageData] = useState([]);
  // The data for the images we are currently displaying
  const [images, setImages] = useState([]);
  // The image that is selected in the carousel right now
  const [selected, setSelected] = useState(null);
  // The image that is selected by the player to start the game with
  const [selectedImage, setSelectedImage] = useState(null);
  // The username of the player
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );

  // Get the image data and set the initial images to be centered on the first
  useEffect(() => {
    getImageData()
      .then((data) => {
        setImageData(data);
        setImages([data.at(-1), data[0], data[1]]);
        setSelectedImage(data[0]);
      })
      .catch((error) => {
        console.error("Failed to fetch image data:", error);
      });
  }, []);

  function play(image) {
    return startGame(image, userName);
  }

  const content = selected ? (
    <SelectedImage selected={selected} setSelected={setSelected} play={play} />
  ) : (
    <ImageSelect
      imageData={imageData}
      setImageData={setImageData}
      images={images}
      setImages={setImages}
      selectedImage={selectedImage}
      setSelectedImage={setSelectedImage}
      userName={userName}
      setUserName={setUserName}
      setSelected={setSelected}
    />
  );

  return <main className="mainSetup responsivePadding">{content}</main>;
}
