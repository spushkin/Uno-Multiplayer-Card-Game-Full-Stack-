const express = require("express");
const moment = require("moment");
const crypto = require("crypto");
const Games = require("../db/games");

const router = express.Router();

// const generateUniqueId = async (length = 6) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let joincode = '';
//     let isUnique = false;

//     do {
//         joincode = '';
//         const bytes = crypto.randomBytes(length);
//         for (let i = 0; i < bytes.length; i++) {
//             joincode += characters[bytes[i] % characters.length];
//         }
//         const existingCode = await Games.checkJoinCode(joincode);
//         isUnique = !existingCode;
//         console.log(existingCode);
//     } while (!isUnique);

//     return joincode;
// };

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

router.get("/", (request, response) => {
	const { username, userId } = request.session;

	Games.getAllJoinableGames({ userId })
		.then((games) => {
			games.forEach((game) => {
				game.createdAt = moment(game.createdAt).fromNow();
			});

			response.render("home", {
				username,
				userId,
				games: games ? games : [],
				title: "Home",
			});
		})
		.catch(handleNewPublicGameError(response, "/home"));
});

const handleNewPublicGameError = (response, redirectUri) => (error) => {
	console.log({ error });
	response.redirect(redirectUri);
};

router.post("/generatePublicGame", (request, response) => {
	const { userId, username } = request.session;
	const { maxPlayers } = request.body;
	Games.createPublicGame({ userId, maxPlayers, username })
		.then((res) => {
			console.log(`${res}`);
			response.redirect(`/home/lobby/${res}`);
		})
		.catch(handleNewPublicGameError(response, "/home"));
});

router.post("/generatePrivateGame", (request, response) => {
	const { userId, username } = request.session;
	const { maxPlayers } = request.body;
	// const code = generateUniqueId();
	// console.log(code);
	Games.createPrivateGame({ userId, username, maxPlayers })
		.then((res) => {
			response.redirect(`/home/lobby/` + res);
		})
		.catch(handleNewPublicGameError(response, "/home"));
});

router.post("/joinPrivateGame", async (request, response) => {
	const { userId, username } = request.session;
	const { code } = request.body;

	Games.joinPrivateGame({ userId, code, username })
		.then((res) => {
			request.app.io.emit(`newPlayerJoin:${res.id}`);
			response.redirect(`/home/lobbySub/${res.id}`);
		})
		.catch(handleNewPublicGameError(response, "/home"));
});


// Route to handle the join logic
router.post("/join/:id", async (request, response) => {
	const { userId, username } = request.session;
	const gameId = request.params.id;

	Games.joinPublicGame({ userId, gameId: parseInt(gameId, 10), username })
		.then((res) => {
			response.redirect(`/home/lobbySub/${res}`);
		})
		.catch(handleNewPublicGameError(response, "/home"));
	request.app.io.emit(`newPlayerJoin:${gameId}`);
});

// Route to render the lobby after joining
router.get("/lobbySub/:id", async (request, response) => {

	const { username, userId } = request.session;
	const gameId = request.params.id;
	try {
		const game = await Games.getGame({
			game_id: gameId,
		});
		const userSeat = await Games.getPlayerSeat({ gameId, userId });
		const players = await Games.getPlayersByGameId({ gameId });

		response.render("lobby", {
			username: username,
			title: "Lobby",
			userId: userId,
			gameId: gameId,
			seat: userSeat,
			maxPlayers: game.max_players,
			players: players,
			isPrivate: game.isPrivate,
			joinCode: game.joinCode
		});
	} catch (error) {
		console.log(error);
		response.redirect("/home");
	}
});

router.get("/lobby/:id", async (request, response) => {
	const { username, userId } = request.session;
	const gameId = request.params.id;
	try {
		const players = await Games.getPlayersByGameId({ gameId });
		const game = await Games.getGame({ game_id: gameId });
		const userSeat = await Games.getPlayerSeat({ gameId, userId });
		if (!game) {
			// Handle invalid game ID
			return response.redirect("/home");
		}

		response.render("lobbyOwner", {
			username: username,
			title: "Lobby",
			userId: userId,
			gameId: gameId,
			seat: userSeat,
			maxPlayers: game.max_players,
			players: players,
			isPrivate: game.isPrivate,
			joinCode: game.joinCode
		});
	} catch (error) {
		console.log(error);
		response.redirect("/home");
	}
});

router.get("/game/:id", async (request, response) => {
	const { username, userId } = request.session;
	const gameId = request.params.id;
	const players = await Games.getPlayersByGameId({ gameId });
	const game = await Games.getGame({
		game_id: gameId,
	});

	let gameStarted = (await Games.gameStarted({ gameId })).length > 0;

	if (!gameStarted) {
		await Games.updateSeatState({
			gameId,
			seat: 1,
			current: true,
		});
	}

	const userSeat = await Games.getPlayerSeat({
		gameId,
		userId,
	});

	response.render("table", {
		username: username,
		title: "Home",
		userId: userId,
		gameId: gameId,
		seat: userSeat.seat,
	});

	await sleep(3000);

	if (game.number >= 2) {
		if (!gameStarted) {
			for (let seat = 1; seat <= players.length; seat++) {
				const cardsForSeat = [];
				for (let index = 0; index < 7; index++) {
					const unusedCards = await Games.getUnusedCards({ gameId });
					if (unusedCards.length === 0) {
						console.error("No unused cards available.");
						break; // Exit the loop or handle this scenario appropriately
					}
					const card =
						unusedCards[Math.floor(Math.random() * unusedCards.length)];
					await Games.giveCardToPlayer({
						gameId,
						cardId: card.id,
						seat,
					});
					cardsForSeat.push(card);
				}

				request.app.io.emit(`setPlayerCards:${gameId}`, {
					gameId,
					seat,
					cards: cardsForSeat,
				});
			}

			const unusedCards = await Games.getUnusedCards({ gameId });
			let card = unusedCards[Math.floor(Math.random() * unusedCards.length)];
			while (card.type > 9) {
				card = unusedCards[Math.floor(Math.random() * unusedCards.length)];
			}
			await Games.updateCurrentCard({ gameId, currentCard: card.id });
			request.app.io.emit(`setCurrentCard:${gameId}`, {
				card,
			});

			request.app.io.emit(`setTurnPlayer:${gameId}`, {
				seat: 1,
			});
		} else {
			for (let seat = 1; seat <= players.length; seat++) {
				const cards = await Games.getSeatCards({
					gameId,
					seat,
				});
				request.app.io.emit(`setPlayerCards:${gameId}`, {
					gameId,
					seat,
					cards: cards,
				});
			}

			const seat = await Games.getCurrentSeat({ gameId });
			request.app.io.emit(`setTurnPlayer:${gameId}`, {
				seat: seat.seat,
			});

			const currentCard = await Games.getGameCurrentCard({ gameId });
			request.app.io.emit(`setCurrentCard:${gameId}`, {
				card: currentCard,
			});
		}
	}
});

module.exports = router;
