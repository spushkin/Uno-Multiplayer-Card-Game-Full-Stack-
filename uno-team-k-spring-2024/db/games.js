const db = require("./index");
const bcrypt = require("bcrypt");

const CREATE_PUBLIC =
	'INSERT INTO games ("userId", max_players, current_card) VALUES (${userId}, ${maxPlayers}, 7) RETURNING id';

const CREATE_PRIVATE =
	'INSERT INTO games ("userId", "isPrivate", "joinCode", max_players) VALUES (${userId}, true, ${joinCode}, ${maxPlayers}) RETURNING id';

const GET_ALL_GAMES =
	'SELECT games.max_players, games.id, games."createdAt", number, "userId", "isPrivate", "joinCode", users.username FROM games, users where "userId" = "users"."id"';

const GET_JOINED_GAMES =
	"SELECT game_id FROM game_users where user_id=${user_id}";

const GET_GAMES_BY_USERID =
	'SELECT games.max_players, games.id, games."createdAt", "userId", number, "isPrivate", "joinCode", users.username FROM games JOIN users on "userId" = users.id WHERE "userId"=${userId}';

const GET_GAMES_BY_CODE = 'select id from games where "joinCode"=${code}';

const GET_MY_GAMES =
	"select * from game_users join games on game_id=id where user_id=${userId}";

const ADD_USER_SQL =
	"INSERT INTO game_users (game_id, user_id, user_name, seat) VALUES (${game_id}, ${userId}, ${username}," +
	"(SELECT (SELECT COALESCE((SELECT seat FROM game_users WHERE game_id = ${game_id} ORDER BY seat DESC LIMIT 1), 0))+1)) RETURNING game_id";

const REMOVE_USER_SQL =
	"DELETE FROM game_users WHERE game_id = ${gameId} AND user_id=${userId}";

const DECREASE_GAME_PLAYERS_COUNT =
	"update games set number=number-1 where id=${game_id}";

const GET_GAME = "SELECT * FROM games WHERE id = ${game_id}";

const LOOKUP_USER_IN_GAMEUSERS_BY_ID =
	"select user_id from game_users where game_id=${game_id} and user_id=${userId}";

const COUNT_PLAYERS =
	"SELECT COUNT(user_id) FROM game_users where id=${game_id};";

const UPDATE_GAME_PLAYERS_COUNT =
	"update games set number=number+1 where id=${game_id}";

const GET_UNUSED_CARDS =
	"SELECT * FROM cards WHERE id NOT IN (SELECT card_id FROM game_cards WHERE game_id = ${game_id});";

const GIVE_CARD_TO_SEAT =
	"INSERT INTO game_cards (game_id, card_id, user_id) VALUES (${gameId}, ${cardId}, (SELECT user_id FROM game_users WHERE game_id = ${gameId} AND seat = ${seat}))";

const GET_CURRENT_PLAYER =
	"SELECT seat FROM game_users WHERE game_id=${game_id} AND current = TRUE;";

const SET_CURRENT_SEAT =
	"UPDATE game_users SET current = ${current} WHERE game_id = ${gameId} AND seat = ${seat}";

const GET_PLAYER_SEAT =
	"SELECT seat FROM game_users WHERE game_id=${game_id} AND user_id=${user_id};";

const GET_CURRENT_SEAT =
	"SELECT user_id, seat FROM game_users WHERE game_id=${game_id} AND current=TRUE;";

const GET_PLAYER_CARDS =
	"SELECT * FROM game_cards JOIN cards c on c.id = game_cards.card_id WHERE game_id=${gameId} AND user_id=${userId};";

const GET_SEAT_CARDS =
	"SELECT * FROM game_cards" +
	" JOIN cards c on c.id = game_cards.card_id" +
	" JOIN game_users gu on game_cards.game_id = gu.game_id and game_cards.user_id = gu.user_id" +
	" WHERE game_cards.game_id = ${gameId} AND seat=${seat};";

const GET_PLAYER_CARD =
	"SELECT * FROM game_cards WHERE game_id=${gameId} AND user_id=${userId} AND card_id=${cardId}";

const DELETE_CARD =
	"DELETE FROM game_cards WHERE game_id = ${gameId} AND card_id = ${cardId} AND user_id = ${userId}";

const CLEANUP_GAME = "DELETE FROM games WHERE id=${gameId}";

const CLEANUP_GAME_CARDS = "DELETE FROM game_cards WHERE game_id=${gameId}";

const CLEANUP_GAME_USERS = "DELETE FROM game_users WHERE game_id=${gameId}";

const UPDATE_GAME_CURRENT_CARD =
	"update games set current_card=${currentCard} where id=${gameId}";

const GET_GAME_CURRENT_CARD =
	"select c.id, c.type, c.color from games JOIN cards c on c.id = games.current_card where games.id=${gameId}";

const GET_CARD = "SELECT * FROM cards WHERE id = ${cardId}";

const UPDATE_GAME_DIRECTION =
	"update games set game_direction=${gameDirection} where id=${gameId}";

const UPDATE_GAME_LAST_COLOR_PICKED =
	"update games set last_color_picked=${lastColorPicked} where id=${gameId}";

const GET_PLAYERS_BY_GAME_ID =
	"SELECT user_name FROM game_users WHERE game_id = ${gameId}";

// const CHECK_JOIN_CODE =
// 	"SELECT id FROM games WHERE joinCode = ${joincode}";

// const checkJoinCode = (joincode) => {
// 	console.log(joincode);
// 	return db.none(CHECK_JOIN_CODE, {joincode});
// 	};

const getPlayersByGameId = ({ gameId }) => {
	return db
		.any(GET_PLAYERS_BY_GAME_ID, { gameId })
		.then((players) => {
			return players;
		})
		.catch((err) => {
			console.error("Error fetching players by game ID:", err);
			throw err;
		});
};

const createPublicGame = ({ userId, maxPlayers, username }) => {
	return db
		.one(CREATE_PUBLIC, { userId: userId, maxPlayers })
		.then(({ id }) => {
			db.one(ADD_USER_SQL, { game_id: id, userId, username });
			return id;
		})
		.then((game_id) => {
			db.query(UPDATE_GAME_PLAYERS_COUNT, { game_id: game_id });
			return game_id;
		});
};

const createPrivateGame = ({ userId, username, code, maxPlayers }) => {
	return bcrypt.hash(toString(code), 10).then((hash) => {
		return db
			.one(CREATE_PRIVATE, {
				userId: userId,
				joinCode: hash.substring(hash.length - 10, hash.length),
				maxPlayers,
			})
			.then(({ id }) => {
				db.one(ADD_USER_SQL, { game_id: id, userId, username });
				return id;
			})
			.then((game_id) => {
				db.query(UPDATE_GAME_PLAYERS_COUNT, { game_id: game_id });
				return game_id;
			});
	});
};

const getAllGames = () => {
	return db.any(GET_ALL_GAMES);
};

const getAllJoinableGames = ({ userId }) => {
	return db
		.any(GET_ALL_GAMES)
		.then((games) => {
			return db.any(GET_JOINED_GAMES, { user_id: userId }).then((g) => {
				let newGames = [];
				let gg = [];

				if (g) {
					g.forEach((el) => {
						gg.push(el.game_id);
					});
				}

				if (games) {
					games.forEach((game) => {
						if (!gg.includes(game.id)) {
							newGames.push(game);
						}
					});
				}

				return newGames;
			});
		})
		.catch((err) => {
			return console.log(err);
		});
};

const getMyGames = ({ userId }) => {
	return db.any(GET_MY_GAMES, { userId: userId });
};

const getGamesByUserId = ({ userId }) => {
	return db.any(GET_GAMES_BY_USERID, { userId: userId });
};

const countPlayers = ({ game_id }) => {
	return db.any(COUNT_PLAYERS, { game_id: game_id });
};

const getGame = ({ game_id }) => {
	return db.one(GET_GAME, { game_id });
};

const joinPublicGame = ({ userId, gameId, username }) => {
	return db
		.none(LOOKUP_USER_IN_GAMEUSERS_BY_ID, {
			game_id: gameId,
			userId,
		})
		.then(() => db.one(ADD_USER_SQL, { game_id: gameId, userId, username }))
		.then(() => {
			db.query(UPDATE_GAME_PLAYERS_COUNT, { game_id: gameId });
			return gameId;
		});
};

const joinPrivateGame = ({ userId, code, username }) => {
    return db
        .one(GET_GAMES_BY_CODE, { userId, code })
        .then((el) => {
            return db.none(LOOKUP_USER_IN_GAMEUSERS_BY_ID, {
                game_id: el.id,
                userId,
            })
            .then(() => {
                return el;
            });
        })
        .then((el) => {
            return db.one(ADD_USER_SQL, { game_id: el.id, userId, username })
                .then(() => {
                    return el;
                });
        })
        .then((el) => {
            return db.query(UPDATE_GAME_PLAYERS_COUNT, { game_id: el.id })
                .then(() => {
                    return el;
                });
        })
        .catch((err) => {
            // Handle errors
            console.log(err);
            return err;
        });
};

const getUnusedCards = ({ gameId }) => {
	return db
		.any(GET_UNUSED_CARDS, {
			game_id: gameId,
		})
		.catch((err) => {
			return console.log(err);
		});
};

const giveCardToPlayer = ({ gameId, cardId, seat }) => {
	return db.any(GIVE_CARD_TO_SEAT, {
		gameId,
		cardId,
		seat,
	});
};

const gameStarted = ({ gameId }) => {
	return db.any(GET_CURRENT_PLAYER, {
		game_id: gameId,
	});
};

const updateSeatState = ({ gameId, seat, current }) => {
	return db.any(SET_CURRENT_SEAT, {
		gameId,
		seat,
		current,
	});
};

const getPlayerSeat = ({ gameId, userId }) => {
	return db.one(GET_PLAYER_SEAT, {
		game_id: gameId,
		user_id: userId,
	});
};

const removePlayerFromGame = ({ gameId, userId }) => {
	return db.result(REMOVE_USER_SQL, { gameId, userId });
};

const decreasePlayerCount = ({ gameId }) => {
	return db.result(DECREASE_GAME_PLAYERS_COUNT, { game_id: gameId });
};

const getCurrentSeat = ({ gameId }) => {
	return db.one(GET_CURRENT_SEAT, {
		game_id: gameId,
	});
};

const getPlayerCards = ({ gameId, userId }) => {
	return db.any(GET_PLAYER_CARDS, {
		gameId,
		userId,
	});
};

const getSeatCards = ({ gameId, seat }) => {
	return db.any(GET_SEAT_CARDS, {
		gameId,
		seat,
	});
};

const playerHasCard = ({ gameId, userId, cardId }) => {
	return db.one(GET_PLAYER_CARD, {
		gameId,
		userId,
		cardId,
	});
};

const deleteCard = ({ gameId, userId, cardId }) => {
	return db.any(DELETE_CARD, {
		gameId,
		userId,
		cardId,
	});
};

const cleanupGame = ({ gameId }) => {
	return db
		.any(CLEANUP_GAME_CARDS, { gameId })
		.then(() => db.any(CLEANUP_GAME_USERS, { gameId }))
		.then(() => db.any(CLEANUP_GAME, { gameId }));
};

const updateCurrentCard = ({ gameId, currentCard }) => {
	return db.any(UPDATE_GAME_CURRENT_CARD, { gameId, currentCard });
};

const getGameCurrentCard = ({ gameId }) => {
	return db.one(GET_GAME_CURRENT_CARD, { gameId });
};

const getCard = ({ cardId }) => {
	return db.one(GET_CARD, { cardId });
};

const updateGameDirection = ({ gameId, gameDirection }) => {
	return db.any(UPDATE_GAME_DIRECTION, { gameId, gameDirection });
};

const updateGameLastColorPicked = ({ gameId, lastColorPicked }) => {
	return db.any(UPDATE_GAME_LAST_COLOR_PICKED, { gameId, lastColorPicked });
};

module.exports = {
	decreasePlayerCount,
	getPlayersByGameId,
	getAllJoinableGames,
	countPlayers,
	getMyGames,
	joinPrivateGame,
	joinPublicGame,
	createPrivateGame,
	getGamesByUserId,
	getAllGames,
	createPublicGame,
	getGame,
	getUnusedCards,
	giveCardToPlayer,
	gameStarted,
	updateSeatState,
	getPlayerSeat,
	getCurrentSeat,
	getPlayerCards,
	getSeatCards,
	playerHasCard,
	deleteCard,
	cleanupGame,
	updateCurrentCard,
	getGameCurrentCard,
	getCard,
	updateGameDirection,
	updateGameLastColorPicked,
	removePlayerFromGame,
	// checkJoinCode
};
