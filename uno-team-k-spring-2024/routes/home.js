const express = require("express");
const moment = require("moment");

const Games = require("../db/games");

const router = express.Router();

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

router.get("/mygames", (request, response) => {
	const { username, userId } = request.session;

	Games.getMyGames({ userId })
		.then((games) => {
			games.forEach((game) => {
				game.createdAt = moment(game.createdAt).fromNow();
			});

			let tt = games ? games : [];

			response.render("my-games", {
				username,
				userId,
				games: games ? games : [],
				title: "Active Games",
			});
		})

		.catch(handleNewPublicGameError(response, "/home"));
});

router.get("/create", (request, response) => {
	const { username, userId } = request.session;

	Games.getGamesByUserId({ userId })
		.then((games) => {
			games.forEach((game) => {
				game.createdAt = moment(game.createdAt).fromNow();
			});

			response.render("create-main", {
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
			response.redirect(`/home/game/` + res);
		})
		.catch(handleNewPublicGameError(response, "/home"));
});

router.post("/generatePrivateGame", (request, response) => {
	const { userId } = request.session;
	const { maxPlayers } = request.body;
	const code = Date.now();

	Games.createPrivateGame({ userId, code, maxPlayers })
		.then((res) => {
			response.redirect(`/home/game/` + res);
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

router.post("/join/:id", (request, response) => {
	const { userId } = request.session;
	const gameId = request.params.id;

	Games.joinPublicGame({ userId, gameId: parseInt(gameId, 10) })
		.then((res) => {
			response.redirect(`/home/game/${gameId}`);
		})
		.catch(handleNewPublicGameError(response, "/home"));
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

	if (game.number === game.max_players) {
		if (!gameStarted) {
			for (let seat = 1; seat <= game.max_players; seat++) {
				const cardsForSeat = [];
				for (let card = 0; card < 7; card++) {
					const unusedCards = await Games.getUnusedCards({ gameId });
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
