const socket5 = io();
const messageFieldG = document.querySelector("#message-field-g");

// global chat
// alays listens to /chat/0
if (messageFieldG) {
	messageFieldG.addEventListener("keydown", (event) => {
		if (event.keyCode === 13) {
			fetch(`/chat/0`, {
				method: "post",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: event.target.value }),
			})
				.then(() => {
					console.log(event.target.value);
					document.querySelector("#message-g").value = "";
				})
				.catch((error) => console.log(error));
		}
	});

	const messages = document.querySelector("#messages-g");

	socket5.on(`chat:0`, ({ sender, user, message, timestamp }) => {
		const template = document.querySelector("#message-g");

		const contentG = template.content.cloneNode(true);
		contentG.querySelector(".sender-g").innerText = sender;
		contentG.querySelector(".content-g").innerText = message;

		const date = new Date(timestamp);

		if (document.querySelector(`.userId-g-${user}`) !== null) {
			contentG
				.querySelector(".message-body-g")
				.classList.add("message-body-right-g");
			contentG.querySelector(".sender-g").classList.add("messages-right-g");
			contentG.querySelector(".content-g").classList.add("content-right-g");
		}

		contentG.querySelector(".timestamp-g").innerText = `${
			date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
		}:${date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()}:${
			date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
		} ${date.toDateString()}`;

		messages.appendChild(contentG);

		document.getElementById("chats-g").scrollBy({
			top: 100,
			behavior: "smooth",
		});

		messages.scrollBy({
			top: 100,
			behavior: "smooth",
		});

		document.querySelector("#message-field-g").value = "";
	});
}
