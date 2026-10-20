# odin-waldo-frontend
The Odin Project Where's Waldo Project Frontend

Notes: 
Frontend: 
Provide start splash screen with play button or something. Require players to enter their name.
Have selection of different pictures user can choose from.
Loads Picture and based on picture id (i guess), get number of characters and their names from backend. do not sent coordinates as well.
Once picture has loaded, send request to backend to start timer.
Lets users click on a place in a picture, and select a character name. 
send coordinate and nameId to backend
Provide feedback if incorrect or keep selection if correct (with name, LOCK IN)

VISUAL DESIGN: 
Have nav bar with logo (not needed maybe)
Start screen is side by side thumbnails of images to choose, with empty player name input at the bottom. clicking on the image will start the game IF the player has entered a valid name. (3-32 characters) (the name is saved and when the player
clicks on new game or reloads, the name should remain saved for the player, but they can change it any time (maybe localstorage))
display of thumbnails and records (10 best) still up in the air... considering details of the layout later. maybe use start button isntead of clicking on thumbnails, and clicking on thumbnails will reveal records. 

Gameboard: 
desktop: 4fr 1fr, 4fr filled with image, 1fr filled with characters to choose from and names
mobile: screen filled with image, floating button opens full screen offcanvas showing all characters. maybe game starts with this open, and plyer has to close it first. considering. 


