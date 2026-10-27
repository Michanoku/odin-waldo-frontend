import { useEffect, useState, useLayoutEffect, useRef } from "react";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { getImageData } from "../api/api.js";
import urls from "../api/urls.js";
import "../styles/setup.css";

function ImageList() {
  // All images and displayed images have a different state
  const [imageData, setImageData] = useState([]);
  const [images, setImages] = useState([]);

  // This is for the copy of the image fading out to the right
  const [exitingImage, setExitingImage] = useState(null);

  // This is for references to the rendered image elements
  const imageRefs = useRef(new Map());

  // This is for image positions and scales before the carousel changes
  const previousPositions = useRef(null);

  // Reference to the exiting image copy that fades away
  const exitingRef = useRef(null);

  // Tracks the ID of the incoming image so it can be animated
  const enteringId = useRef(null);

  // Tracks the direction of the current scroll ("next" or "previous")
  const scrollDirection = useRef("next");

  // Get the image data and set the initial images to be centered on the first
  useEffect(() => {
    getImageData()
      .then((data) => {
        setImageData(data);
        setImages([data.at(-1), data[0], data[1]]);
      })
      .catch((error) => {
        console.error("Failed to fetch image data:", error);
      });
  }, []);

  // Handle the scroll of the images to either left or right (previous or next)
  const handleScroll = (direction) => {
    // Depending on which direction we are going, get index of exiting image
    const exitingIndex = direction === "next" ? 0 : 2;
    // Get the actual element
    const exitingElement = imageRefs.current.get(images[exitingIndex].id);

    // Set all the data we need for the exiting image to animate properly
    setExitingImage({
      image: images[exitingIndex],
      rect: exitingElement.getBoundingClientRect(),
      width: exitingElement.offsetWidth,
      height: exitingElement.offsetHeight,
      scale: 0.8,
      lift: "-1rem",
      direction,
    });

    // Get each images position, scale and lift
    previousPositions.current = new Map(
      images.map((image, index) => {
        const element = imageRefs.current.get(image.id);

        return [
          image.id,
          {
            rect: element.getBoundingClientRect(),
            scale: index === 1 ? 1 : 0.8,
            lift: index === 1 ? "0px" : "-1rem",
          },
        ];
      }),
    );

    // Get the new array of images after the scroll
    const nextImages = scrollImages(direction, imageData, images);

    // Get the id of the element that will scroll into view
    enteringId.current = nextImages[direction === "next" ? 2 : 0].id;
    // Get the direction of the scrull
    scrollDirection.current = direction;
    // Set the images
    setImages(nextImages);
  };

  // Create two shorthands for the two scroll directions
  const handleNext = () => handleScroll("next");
  const handlePrevious = () => handleScroll("previous");

  // Layout effect used for images (beside the exiting one)
  useLayoutEffect(() => {
    // Get the previous position
    const previous = previousPositions.current;

    // Not all use this so return if not
    if (!previous) return;

    images.forEach((image, index) => {
      // Get the element for the current image
      const element = imageRefs.current.get(image.id);

      // Retrieve the image's saved position and appearance before the change
      const oldData = previous.get(image.id);

      // If the index is not 1, the image needs to be smaller and higher
      const newScale = index === 1 ? 1 : 0.8;
      const newLift = index === 1 ? "0px" : "-1rem";

      // Check if this image is the newly entering image
      const isEntering = enteringId.current === image.id;

      // The new image has no previous position, so give it starting positions
      if (isEntering) {
        element.style.transition = "none";
        element.style.opacity = "0";
        element.style.setProperty("--start-scale", "0.6");
        element.style.setProperty(
          "--flip-x",
          scrollDirection.current === "next" ? "300px" : "-300px",
        );
        element.style.setProperty("--flip-y", "0px");
        element.style.setProperty("--lift", "-2rem");
        return;
      }

      // Get the image's new position and saved position
      const newRect = element.getBoundingClientRect();
      const { rect: oldRect, scale: oldScale, lift: oldLift } = oldData;

      // Calculate how far the image needs to move
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;

      // Disable transitions and apply the old properties making the image appear in its original location
      element.style.transition = "none";
      element.style.setProperty("--start-scale", oldScale);
      element.style.setProperty("--flip-x", `${dx}px`);
      element.style.setProperty("--flip-y", `${dy}px`);
      element.style.setProperty("--lift", oldLift);

      // Force changes before starting the animation
      void element.offsetWidth;

      // Re-enable transitions and transition image
      element.style.transition = "";
      element.style.setProperty("--start-scale", newScale);
      element.style.setProperty("--flip-x", "0px");
      element.style.setProperty("--flip-y", "0px");
      element.style.setProperty("--lift", newLift);
    });

    // Apply the incoming image's initial state before animating
    const enteringElement = enteringId.current
      ? imageRefs.current.get(enteringId.current)
      : null;

    // If this is the elemnt coming in'
    if (enteringElement) {
      void enteringElement.offsetWidth;

      requestAnimationFrame(() => {
        enteringElement.style.transition = "";
        enteringElement.style.opacity = "1";
        enteringElement.style.setProperty("--start-scale", "0.8");
        enteringElement.style.setProperty("--lift", "-1rem");
        enteringElement.style.setProperty("--flip-x", "0px");
      });
    }

    previousPositions.current = null;
    enteringId.current = null;
  }, [images]);

  // Layout effect used for the exiting image in particular
  useLayoutEffect(() => {
    // Stop if there is no exiting image
    if (!exitingImage || !exitingRef.current) return;

    const element = exitingRef.current;
    const { rect, width, height, scale, lift, direction } = exitingImage;

    // Convert  lift from rem to pixels for the vertical offset
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const liftPx = parseFloat(lift) * rootFontSize;

    // Remove from the normal document flow
    element.style.position = "fixed";
    // Set styles
    element.style.left = `${rect.left - (width - rect.width) / 2}px`;
    element.style.top = `${
      rect.top - (height - rect.height) / 2 - liftPx * scale
    }px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.boxSizing = "border-box";

    // Set the starting appearance
    element.style.transition = "none";
    element.style.opacity = "1";
    element.style.setProperty("--start-scale", scale);
    element.style.setProperty("--flip-x", "0px");
    element.style.setProperty("--flip-y", "0px");
    element.style.setProperty("--lift", lift);

    // Force applying the starting styles
    void element.offsetWidth;

    // Re-enable CSS transitions
    element.style.transition = "";

    // Animate the element
    const frameId = requestAnimationFrame(() => {
      element.style.opacity = "0";
      element.style.setProperty("--start-scale", "0.6");
      element.style.setProperty("--lift", "-2rem");
      element.style.setProperty(
        "--flip-x",
        `${direction === "next" ? -rect.width : rect.width}px`,
      );
    });

    // Cancel the pending animation frame if the effect is cleaned up before the callback runs
    return () => cancelAnimationFrame(frameId);
  }, [exitingImage]);

  // Determine which images are shown when scrolling
  const scrollImages = (direction, imageData, images) => {
    // Empty array to store new images
    const newImages = [];

    // If we are scrolling right (i.e. to the next image)
    if (direction === "next") {
      // Immediately add images 1 and 2 (2 and 3 in the array)
      newImages.push(images[1], images[2]);

      // Find the rightmost image
      const index = imageData.findIndex((image) => image.id === images[2].id);
      // Calculate the next index, wrapping around if necessary
      const nextIndex = (index + 1) % imageData.length;

      // Push the image
      newImages.push(imageData[nextIndex]);
    } else {
      // Find the leftmost image
      const index = imageData.findIndex((image) => image.id === images[0].id);
      // Calculate the previous index, wrapping around if necessary
      const previousIndex = (index - 1 + imageData.length) % imageData.length;

      // Push the image
      newImages.push(imageData[previousIndex], images[0], images[1]);
    }

    // Return the new array
    return newImages;
  };

  // If we don't have any images, show a loading message
  if (images.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="imageCarousel">
      <div className="imageList">
        {images.map((image, index) => (
          <ImageThumb
            key={image.id}
            image={image}
            index={index}
            imageRefs={imageRefs}
          />
        ))}

        {exitingImage && (
          <ImageThumb
            key={`exit-${exitingImage.image.id}`}
            image={exitingImage.image}
            index={0}
            exiting
            exitingRef={exitingRef}
            onExitComplete={() => setExitingImage(null)}
          />
        )}
      </div>
      <div className="center">
        <button onClick={handlePrevious}>
          <ArrowBigLeft />
        </button>
        <button onClick={handleNext}>
          <ArrowBigRight />
        </button>
      </div>
    </div>
  );
}

function ImageThumb({
  image,
  index,
  imageRefs,
  exiting = false,
  exitingRef,
  onExitComplete,
}) {
  return (
    <div
      ref={(element) => {
        // If exiting image store element
        if (exiting) {
          if (exitingRef) exitingRef.current = element;
          return;
        }
        // Store image element in map, with id
        if (element) {
          imageRefs.current.set(image.id, element);
        } else {
          // Remove the from map on unmount
          imageRefs.current.delete(image.id);
        }
      }}
      // Apply the correct styles when rendering, using classes
      className={`imageContainer ${index !== 1 ? "aside" : ""} ${
        exiting ? "exiting" : ""
      }`}
      onTransitionEnd={(event) => {
        // Wait for fadeout before removing
        if (exiting && event.propertyName === "opacity") {
          onExitComplete?.();
        }
      }}
    >
      <button
        className="imageButton"
        data-id={image.id}
        data-image={`${urls.backend}${image.imageUrl}`}
        data-records={image.records}
        disabled={exiting}
      >
        <img
          src={`${urls.backend}${image.thumbUrl}`}
          width={300}
          height={200}
          alt={image.name}
        />
      </button>
    </div>
  );
}

export default function Setup({ setGameState }) {
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "",
  );

  return (
    <main className="mainSetup responsivePadding">
      <div className="mainTitle">Character Search</div>
      <ImageList />
      <div className="center">
        <div className="inputGroup">
          <label htmlFor="nameInput">Player Name</label>
          <input
            className="nameInput"
            id="nameInput"
            type="text"
            defaultValue={userName}
            onChange={(event) => {
              setUserName(event.target.value);
              localStorage.setItem("userName", event.target.value);
            }}
            minLength={3}
            maxLength={32}
          />
        </div>
      </div>
    </main>
  );
}
