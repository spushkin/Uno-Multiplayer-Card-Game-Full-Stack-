const gameSocket = io();

// Retrieve userId from the hidden span
const gameId = parseInt(document.querySelector("#gameIdSpan").innerText);
const ownSeat = parseInt(document.querySelector("#seatSpan").innerText);
const userId = parseInt(document.querySelector("#userIdSpan").innerText); // Newly added line

const playCard = async (id, color) => {
  const colorElem = document.querySelector("#color");

  await fetch(`/play/${gameId}`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "playCard",
      card: id,
      color: colorElem.value,
    }),
  });
};

gameSocket.on(`setPlayerCards:${gameId}`, ({ seat, cards }) => {
  if (seat !== ownSeat) {
    const board = document.querySelector("#board");
    const oldSeat = document.querySelector(`#seat-${seat}`);

    const seatEl = oldSeat || document.createElement("p");
    seatEl.id = `seat-${seat}`;
    seatEl.innerHTML = `Seat ${seat} has ${cards.length} cards`;
    seatEl.innerHTML = `
      <div class="seatInfo alert alert-warning">
        <p>Seat <b>${seat}</b> has <b>${cards.length}</b> cards</p>
      </div>`;

    board.appendChild(seatEl);
  } else {
    const selfCards = document.querySelector("#selfCards");
    selfCards.innerHTML = "";

    cards.forEach((card) => {
      const cardEl = document.createElement("button");
      cardEl.classList.add(`btn-color-${card.color}`);
      cardEl.classList.add("btn");
      cardEl.classList.add("btn-secondary");

      const cardContent = document.createElement("p");
      cardContent.classList.add(`type-${card.type}`);
      cardContent.innerText = "";
      cardEl.append(cardContent);
      cardEl.addEventListener("click", async () => {
        await playCard(card.id);
      });
      selfCards.appendChild(cardEl);
    });
  }
});

gameSocket.on(`setTurnPlayer:${gameId}`, ({ seat }) => {
  const selfTurn = seat === ownSeat;

  document.querySelector("#turnText").innerHTML = selfTurn
    ? "<h1 id='turnGreen'>Your turn</h1>"
    : "<h1 id='turnRed'>Not your turn</h1>";
  const takeCardButton = document.querySelector("#takeCard");
  takeCardButton.disabled = !selfTurn;

  const selfCards = document.querySelector("#selfCards");
  selfCards.childNodes.forEach((child) => {
    child.disabled = !selfTurn;
  });
});

document.querySelector("#takeCard").addEventListener("click", async () => {
  await fetch(`/play/${gameId}`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "takeCard",
    }),
  });
});

gameSocket.on(`endGame:${gameId}`, () => {
  window.location.href = "/home";
});

gameSocket.on(`setCurrentCard:${gameId}`, ({ card }) => {
  const el = document.querySelector("#currentCard");
  el.innerHTML = `<h2>Current card is:</h2> <div class="color-${card.color} type-${card.type}"></div>`;
});

// Add event listener to leave the game
const leaveGameButton = document.querySelector("#leaveGameButton"); // Add an element with this ID
if (leaveGameButton) {
  leaveGameButton.addEventListener("click", () => {
    // Emit the leaveGame event to the server, including gameId and userId
    gameSocket.emit("leaveGame", { gameId, userId });
    // Redirect to the home page or any other desired page
    console.log("Byyyyyyyyye");
    window.location.href = "/home";
  });
}
