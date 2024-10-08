const socket1 = io();
const messageField2 = document.querySelector("#message-field");

// Retrieve userId from the hidden span
const gameId = parseInt(document.querySelector("#gameIdSpan").innerText);
const ownSeat = parseInt(document.querySelector("#seatSpan").innerText);
const userId = parseInt(document.querySelector("#userIdSpan").innerText);

socket1.on("connect", function () {
	socket1.emit("joinGame", gameId);
});


const startGameButton = document.querySelector("#startGameButton");
const leaveGameButton = document.querySelector("#leaveGameButton");
const leaveGameButtonOwner = document.querySelector("#leaveGameButtonOwner");
if (leaveGameButton) {
	leaveGameButton.addEventListener("click", () => {
		socket1.emit("leaveGame", { gameId, userId });
		window.location.href = "/home";
	});
}

if (leaveGameButtonOwner) {
	leaveGameButtonOwner.addEventListener("click", () => {
		socket1.emit("leaveGameOwner", { gameId, userId });
		window.location.href = "/home";
	});
}

if (startGameButton) {
	startGameButton.addEventListener("click", () => {
		socket1.emit("startGame", { gameId });
	});
}

socket1.on("gameStarted", ({ gameId }) => {
	window.location.href = `/home/game/${gameId}`;
});

socket1.on("tooFewPlayers", ({ message }) => {
    alert(message);
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
	

	socket1.on(`newPlayerJoin:${gameId}`, () => {
		location.reload();
	});

	socket1.on(`playerLeave:${gameId}`, () => {
		location.reload();
	});

	socket1.on(`ownerLeave:${gameId}`, () => {
		alert("Owner has left the game, returning home.");
		location.reload();
	});

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
