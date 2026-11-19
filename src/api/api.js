import urls from "./urls.js";

// This function is used for all interactions with the API
async function contactAPI(path, options) {
  try {
    // Contact the API through the path and get the response
    const url = `${urls.backend}${path}`;
    const response = await fetch(url, options);

    // Get the json from the response
    const result = await response.json();

    // If there was an error, show the message and throw the error
    if (!response.ok) {
      const error = new Error(result.message || "Request failed.");
      error.status = response.status;
      throw error;
    }

    // Return the result
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Get all the image data from the backend
export async function getImageData() {
  const path = "images";
  return contactAPI(path);
}

// Start the game by sending image id and user name
export async function startGame(imageId, userName) {
  const path = "start";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId, userName }),
  };
  return contactAPI(path, options);
}

// Attempt to tag a character through coordinates and character id
export async function tagCharacter(xCoord, yCoord, characterId) {
  const path = "tag";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ xCoord, yCoord, characterId }),
  };
  return contactAPI(path, options);
}
