const express = require("express");
const moment = require("moment");
const crypto = require("crypto");
const Games = require("../db/games");

const router = express.Router();

// const generateUniqueShortId(games) = (length = 6) => {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     let result = '';

//     do {
//         result = '';
//         const bytes = crypto.randomBytes(length);
//         for (let i = 0; i < bytes.length; i++) {
//             result += characters[bytes[i] % characters.length];
//         }
//     } while (games.has(result)); // Ensure it's unique by checking against existing games

//     return result;
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
	const { userId } = request.session;
	const { maxPlayers } = request.body;

	Games.createPublicGame({ userId, maxPlayers })
		.then((res) => {
			response.redirect(`/home/lobby/${res}`);
		})
		.catch(handleNewPublicGameError(response, "/home"));
});

router.post("/generatePrivateGame", (request, response) => {
	const { userId } = request.session;
	const { maxPlayers } = request.body;
	const code = Date.now();

	Games.createPrivateGame({ userId, code, maxPlayers })
		.then((res) => {
			response.redirect(`/home/lobby/` + res);
		})
		.catch(handleNewPublicGameError(response, "/home"));
});

router.post("/joinPrivateGame", (request, response) => {
	const { userId } = request.session;
	const { code } = request.body;

	Games.joinPrivateGame({ userId, code })
		.then((res) => {
			response.redirect(`/home/game/${res.id}`);
		})
		.catch(handleNewPublicGameError(response, "/home"));
});

// Route to handle the join logic
router.post("/join/:id", async (request, response) => {
	const { userId } = request.session;
	const gameId = request.params.id;

	Games.joinPublicGame({ userId, gameId: parseInt(gameId, 10) })
		.then((res) => {
			response.redirect(`/home/lobbySub/${res}`);
		})
		.catch(handleNewPublicGameError(response, "/home"));
});

// Route to render the lobby after joining
router.get("/lobbySub/:id", async (request, response) => {
	const { username, userId } = request.session;
	const gameId = request.params.id;
	console.log("---------------------------------------------");
	try {
		const game = await Games.getGame({
			game_id: gameId,
		});
		const userSeat = await Games.getPlayerSeat({ gameId, userId });
		console.log(userSeat);
		const players = await Games.getPlayersByGameId({ gameId });
		console.log("players");

		response.render("lobby", {
			username: username,
			title: "Lobby",
			userId: userId,
			gameId: gameId,
			seat: userSeat,
			maxPlayers: game.max_players,
			players: players,
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
		console.log(players);
		const game = await Games.getGame({ game_id: gameId });
		const userSeat = await Games.getPlayerSeat({ gameId, userId });
		console.log(userSeat);
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
		});
	} catch (error) {
		console.log(error);
		response.redirect("/home");
	}
});

router.get("/game/:id", async (request, response) => {
	const { username, userId } = request.session;

	const gameId = request.params.id;
	const game = await Games.getGame({
		game_id: gameId,
	});

	let gameStarted = (await Games.gameStarted({ gameId })).length > 0;

	if (game.number === game.max_players && !gameStarted) {
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
			for (let seat = 1; seat <= game.max_players; seat++) {
				console.log(seat);
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
			for (let seat = 1; seat <= game.max_players; seat++) {
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
