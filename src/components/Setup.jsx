import { useEffect, useState } from "react";
import { getImageData } from "../api/api.js";

export default function Setup({ setGameState }) {
  // The user can (must) enter their username, it's stored in localstorage and can be retrieved if present
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Contact the API on reloading of the component
    getImageData()
      .then((imageData) => setImages(imageData))
      .catch((error) => {
        console.error("Failed to fetch image data:", error);
      });
  }, []);

  return (
    <main className="mainSetup">
      <div>
        {images.length > 0 ? (
          images.map((image) => <div>{JSON.stringify(image)}</div>)
        ) : (
          <div>
            <p>Loading...</p>
          </div>
        )}
      </div>
      <input
        type="text"
        defaultValue={userName}
        onChange={(event) => {
          setUserName(event.target.value);
          localStorage.setItem("userName", event.target.value);
        }}
      />
    </main>
  );
}
