# The Odin Project - Where Is Waldo? — Frontend

A React-based frontend for a Where Is Waldo?-style browser game, built as part of [The Odin Project](https://www.theodinproject.com/) curriculum.

Players select a scene, find hidden characters, and compete for the fastest completion time. The frontend handles the player interaction with the game, entering their name, selecting an image to play, and trying to find the different characters in the image. The backend handles all the logic. 

## Disclaimer

The scenes are generated with AI image generation. The reason is that I was not sure about using existing busy images for this from known franchises with known characters. I saw some examples from other users using Waldo images or other IPs. I have not done much research about what can be used freely, as I found it hard to find appropriate busy images. However this code works with other images too, so if I had more information about what images can be legally used, I would gladly replace AI with those images. But for now, this is the best I can come up with. And in any case, this project is to showcase the code, not the images. 

## Features

- **Dynamic image selection** — Players can choose the image they want to play from a carousel.
- **Player name input** — Players can enter their name before committing to an image.
- **Interactive game board** — The game board reacts to player clicks by showing a target circle and character options.
- **Character selection interface** — The names of all remaining characters are shown when clicking a location.
- **Real-time feedback** — When the player has made a move, a temporary popup will inform of the result.
- **Completion screen** — When the player has finished, their time and rank will be displayed, along with the top 10.
- **Leaderboards** — Players results are saved in the database on the backend, and the top 10 are displayed in the game.
- **Responsive layout** — The game is designed to work in both mobile and desktop, though desktop is the preferred way. 

## Tech Stack

- **React** — UI and component-based architecture
- **JavaScript** — Application logic
- **CSS** — Styling and responsive layouts
- **Lucide React** — Icons

## How It Works

### 1. Game setup

The frontend doesn't know anything about the available resources for the game. Everything is handled by the backend and the frontend fetches the contents via API. Adding new images and characters to the backend will make them available to the frontend without touching the frontend at all. 

The player can browse images via a carousel, but can only commit to the selection when their username is also entered. 
Once the player has decided on an image, the play button will start the game.

### 2. Playing the game

Once the game is started, the backend will send a token to the frontend, which is then handed back and forth to proceed with the game. Game progress is maintained in the token rather than stored as a separate game session in the database. The starting time of the game and the player name is signed into the token. Each token is valid for 3 minutes, so an idle player will have to start over. Game progress is saved in the token, meaning the found characters ids are stored in it.

The gameboard is an image of a busy location. As an aside, the characters to be found are listed with names. The player can also quit the game at any time through a button. 

When the player clicks on a location, a circle will appear. The circles size is roughly consistent with the range of pixels the characters are assigned to in the backend. Next to the circle a popup will appear with remaining characters names. The popup will try to avoid the bounds of the image, so as not to become inaccessible. 

When the player decides on a character to tag at the location, the frontend will send the calculated coordinates to the backend. The frontend will calculate the coordinates based on a number of factors. To make sure that the coordinates are accurate no matter the size of the actual image displayed, the coordinates of the players click are converted by using the original image dimensions as a base. So if the player clicked on pixel x-100 on their desktop, but the image was displayed at half of its original size, we will consider the click at x-200 for backend communication. Visual confirmation will use the actual coordinates on the image in the players browser. The frontend will wait for the backends response.

### 3. Game feedback

After the backend has been contacted by the frontend to tag a character, the backend checks if the clicked coordinates fall within the range of the selected character. The backends responses will include a message about the success of the tag. If the tag was successful, the progress is updated in the token and the frontend can remove that character from possible selections. If unsuccessful, nothing happens, but a new token with new time limit is still issued.

A toast notification will inform the player about the result of their action. 

### 4. Game completion

After a player tags a character and the backend has determined that the tag was succesful, it will make a second check to determine if the game is over, meaning all characters have been found. If so, no token will be sent back, only the message that the game is over together with the players total time and rank. 

The frontend will use that information to update the leaderboard it has within it's previously received game data, so no new fetch is done as long as the player keeps playing. The completion time, rank, and top 10 are shown to the player. If the player managed to rank in the top 10, their time will be shown visually distinct from the other times. 

The player can then restart the same image or reset the game entirely. 

## Application Structure

The application is mainly divided into three parts: 
Setup, Started and Finished. 

During setup the player chooses their name and the image they want to play.
During started the game progresses as the player makes the choices.
During finished the player can see their results and choose what to do next.

- App - Is responsible for game state and game data, as well as for moving the state along. Renders Setup, Started or Finished based on the game state.
- Setup - Gets the available images from the backend, shows them and their records to the player and handles the player choice of name and which game to begin. Uses ImageList to show the player a list of images to choose from. 
- Started - Manages the immediate data used to play the game (number of characers and their names). Uses GameBoard, SidePanel and Toast to communicate to the player. 
- Finished - Shows the players results, as well as the top 10 for the current image. Lets the player reset or restart.
- ImageList - Essentially a carousel consisting of all available images to play. Players can click back and forth between them and choose one. Uses ImageThumb components to display each image. Uses a lot of react animations to create the illusion of the carousel. 
- GameBoard - The image the player has selected with a hidden popup element that becomes visible when the player clicks on the image. Lets the player select a coordinate and character name for tagging.
- SidePanel - The panel next to the GameBoard that shows the available characters and their names, as well as found characters. Also lets the player quit the game. 
- Toast - Shows a short (3 second) toast when the player made a move. Communicates the result of the move to the player.

## Backend Integration

The frontend communicates with a separate REST API built with **Node.js, Express, and Prisma**. The backend handles game sessions, character validation, timing, and records.

[Backend repository](https://github.com/Michanoku/odin-waldo-backend)

### API Endpoints

The frontend uses three API endpoints:

- **`GET /images`** – Retrieves the available images, including their IDs, image URLs, thumbnails, and records. This data is used to display the image selection screen.

- **`POST /start`** – Starts a new game by sending the selected image ID and the player's username. The backend creates a game session and returns a JWT along with the character IDs and names. Character locations remain on the server and are never exposed to the frontend. No data about the running game is stored on the server.

- **`POST /tag`** – Sends the clicked image coordinates and the selected character ID to the backend. The server checks whether the character was correctly identified and returns the result along with an updated JWT. When all characters have been found, the response also includes the completion time and leaderboard rank.

### JWT Authentication

The backend uses JSON Web Tokens (JWTs) to manage game sessions without requiring user accounts.

When a game starts, the frontend stores the JWT in the browser's `localStorage`. It is then included in the `Authorization` header as a Bearer token with each character-tagging request.

The backend returns an updated token after each attempt, which replaces the previous token in `localStorage`. This keeps track of the player's progress throughout the game.

Once the game is completed or the player quits, the token is removed from `localStorage`.

## Installation and Setup

### Prerequisites

- Node.js
- npm
- Running instance of the backend

### 1. Clone the repository

```bash
git clone https://github.com/Michanoku/odin-waldo-frontend.git
cd odin-waldo-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

The frontend needs the URL of the backend API to communicate with the server.

Create a `.env` file in the root directory and configure the backend URL:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### 4. Start the development server

```bash
npm run dev
```

## Project Structure

The project is organized into reusable React components, API utilities, and styles.

```text
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── api.js
│   │   └── urls.js
│   ├── components/
│   │   ├── setup/
│   │   │   └── ImageList.jsx
│   │   ├── started/
│   │   │   ├── GameBoard.jsx
│   │   │   ├── SidePanel.jsx
│   │   │   └── Toast.jsx
│   │   ├── Setup.jsx
│   │   ├── Started.jsx
│   │   └── Finished.jsx
│   ├── styles/
│   │   ├── index.css
│   │   └── ...
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js
```

## Design Decisions

### Component-based architecture

The main app is divided into the Setup, Started and Finished components, as I felt these are the three main phases of the game. During setup I wanted to get all information the game needs from the player. During started I wanted the player to be able to focus on just progressing into the game. During finished I wanted to just show the player the results and let them decide what to do next. All other outsourced components are mostly to keep files from exploding and putting too many responsibilities into master components. 

### Application state management

Although many components have their own state, the game state is managed by the app itself. The three main components are handed functions that will either start, finish or reset the game, but the actual state changes are handled in the app. 

### Coordinate calculation

When the player clicks the game image, the frontend calculates the click position relative to the displayed image. Since the image may be scaled to fit different screen sizes, these coordinates need to be converted to match the image's original dimensions.

This is done by multiplying the displayed click coordinates by the ratio between the original and displayed image dimensions.

The original click coordinates are used to position the character selection popup visually on the browser image. The converted coordinates are sent to the backend, where they are checked against the characters actual positions to validate the selection.

### Backend communication

In order to discourage cheating, and not give the player any information that would take the fun out of the game, all valid coordinates as well as coordinate checking and the decision of whether the game is over or not are handled by the backend. The frontend will only ever get the results of those checks and decisions. Through this, the frontend is truly independent from the backend, and a game host could add as many images and characters as they wanted without having to worry about the frontend compatibility. 

## Related Project

- [Where Is Waldo? — Backend](https://github.com/Michanoku/odin-waldo-backend)