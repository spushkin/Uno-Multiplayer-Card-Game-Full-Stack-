const socket1 = io();
const messageField2 = document.querySelector("#message-field");

// Retrieve userId from the hidden span
const gameId = parseInt(document.querySelector("#gameIdSpan").innerText);
const ownSeat = parseInt(document.querySelector("#seatSpan").innerText);
const userId = parseInt(document.querySelector("#userIdSpan").innerText);

socket1.on("connect", function () {
	socket1.emit("joinGame", gameId);
});

// Add event listener to leave the game
const startGameButton = document.querySelector("#startGameButton"); // Add an element with this ID

// Add event listener to leave the game
const leaveGameButton = document.querySelector("#leaveGameButton"); // Add an element with this ID
const leaveGameButtonOwner = document.querySelector("#leaveGameButtonOwner"); // Add an element with this ID
if (leaveGameButton) {
	leaveGameButton.addEventListener("click", () => {
		// Emit the leaveGame event to the server, including gameId and userId
		socket1.emit("leaveGame", { gameId, userId });
		// Redirect to the home page or any other desired page
		window.location.href = "/home";
	});
}

if (leaveGameButtonOwner) {
	leaveGameButtonOwner.addEventListener("click", () => {
		// Emit the leaveGame event to the server, including gameId and userId
		socket1.emit("leaveGameOwner", { gameId, userId });
		// Redirect to the home page or any other desired page
		window.location.href = "/home";
	});
}

if (startGameButton) {
	startGameButton.addEventListener("click", () => {
		console.log("emitting");
		socket1.emit("startGame", { gameId });
		console.log("emitted");
	});
}

socket1.on("gameStarted", ({ gameId }) => {
	console.log("Almost");
	window.location.href = `/home/game/${gameId}`;
});

if (messageField2) {
	messageField2.addEventListener("keydown", (event) => {
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

	socket1.on(`chat:${gameId}`, ({ sender, user, message, timestamp }) => {
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
