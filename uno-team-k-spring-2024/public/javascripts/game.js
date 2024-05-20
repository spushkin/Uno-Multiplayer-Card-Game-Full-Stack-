const socket2 = io();
const messageField1 = document.querySelector("#message-field");

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

socket2.on(`setPlayerCards:${gameId}`, ({ seat, cards }) => {
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

socket2.on(`setTurnPlayer:${gameId}`, ({ seat }) => {
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

socket2.on(`endGame:${gameId}`, () => {
	window.location.href = "/home";
});

socket2.on(`setCurrentCard:${gameId}`, ({ card }) => {
	const el = document.querySelector("#currentCard");
	el.innerHTML = `<h2>Current card is:</h2> <div class="color-${card.color} type-${card.type}"></div>`;
});

// Add event listener to leave the game
const leaveGameButton = document.querySelector("#leaveGameButton"); // Add an element with this ID
if (leaveGameButton) {
	leaveGameButton.addEventListener("click", () => {
		// Emit the leaveGame event to the server, including gameId and userId
		socket2.emit("leaveGame", { gameId, userId });
		// Redirect to the home page or any other desired page
		console.log("Byyyyyyyyye");
		window.location.href = "/home";
	});
}

if (messageField1) {
	messageField1.addEventListener("keydown", (event) => {
		if (event.keyCode === 13) {
			fetch(`/chat/${gameId}`, {
				method: "post",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: event.target.value }),
			})
				.then(() => {
					document.querySelector("#message").value = "";
				})
				.catch((error) => console.log(error));
		}
	});

	const messages = document.querySelector("#messages");

	socket2.on(`chat:${gameId}`, ({ sender, user, message, timestamp }) => {
		const template = document.querySelector("#message");

		const content = template.content.cloneNode(true);
		content.querySelector(".sender").innerText = sender;
		content.querySelector(".content").innerText = message;

		const date = new Date(timestamp);

		if (document.querySelector(`.userId-${user}`) !== null) {
			content
				.querySelector(".message-body")
				.classList.add("message-body-right");
			content.querySelector(".sender").classList.add("messages-right");
			content.querySelector(".content").classList.add("content-right");
		}

		content.querySelector(".timestamp").innerText = `${
			date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
		}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${
			date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
		} ${date.toDateString()}`;

		messages.appendChild(content);

		document.getElementById("chats").scrollBy({
			top: 100,
			behavior: "smooth",
		});

		messages.scrollBy({
			top: 100,
			behavior: "smooth",
		});

		document.querySelector("#message-field").value = "";
	});
}
