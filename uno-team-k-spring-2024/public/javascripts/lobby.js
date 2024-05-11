const gameSocket = io();



// Retrieve userId from the hidden span
const gameId = parseInt(document.querySelector("#gameIdSpan").innerText);
const ownSeat = parseInt(document.querySelector("#seatSpan").innerText);
const userId = parseInt(document.querySelector("#userIdSpan").innerText);

gameSocket.on('connect', function() {
  gameSocket.emit('joinGame', gameId);
});

// Add event listener to leave the game
const startGameButton = document.querySelector("#startGameButton"); // Add an element with this ID

// Add event listener to leave the game
const leaveGameButton = document.querySelector("#leaveGameButton"); // Add an element with this ID
const leaveGameButtonOwner = document.querySelector("#leaveGameButtonOwner"); // Add an element with this ID
if (leaveGameButton) {
  leaveGameButton.addEventListener("click", () => {
    // Emit the leaveGame event to the server, including gameId and userId
    gameSocket.emit("leaveGame", { gameId, userId });
    // Redirect to the home page or any other desired page
    window.location.href = "/home";
  });
}

if (leaveGameButtonOwner) {
    leaveGameButtonOwner.addEventListener("click", () => {
      // Emit the leaveGame event to the server, including gameId and userId
      gameSocket.emit("leaveGameOwner", { gameId, userId });
      // Redirect to the home page or any other desired page
      window.location.href = "/home";
    });
  }

  if (startGameButton) {
    startGameButton.addEventListener("click", () => {
      console.log("emitting");
      gameSocket.emit("startGame", { gameId});
      console.log("emitted");
    });
  }

  gameSocket.on('gameStarted', ({ gameId }) => {
    console.log("Almost");
    window.location.href = `/home/game/${gameId}`;
});