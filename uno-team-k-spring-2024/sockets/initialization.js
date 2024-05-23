const socketIO = require("socket.io");
const Games = require("../db/games");
const sessionMiddleware = require("../app-config/session");

const Server = socketIO.Server;

const init = (httpServer, app) => {
	const io = new Server(httpServer);
    const wrap = (middleware) => (socket, next) =>
        middleware(socket.request, {}, next);
    io.use(wrap(sessionMiddleware));
    io.use((socket, next) => {
        const session = socket.request.session;
        if (session && session.authenticated) {
            next();
        } else {
            next(new Error("unauthorized"));
        }
    });

    // Listen to connections and subscribe them to game channels
    io.on("connection", (socket) => {
        socket.on("joinGame", (gameId) => {
            socket.join(`game:${gameId}`);
        });

        socket.on("leaveGame", async ({ gameId, userId }) => {
            socket.leave(`game:${gameId}`);
            await Games.removePlayerFromGame({ gameId, userId});
            await Games.decreasePlayerCount({ gameId});
          });

        socket.on("leaveGameOwner", async ({ gameId, userId }) => {
        socket.leave(`game:${gameId}`);
        const game = await Games.getGame({ game_id: gameId });
        if (game.userId === parseInt(userId, 10)) {
            await Games.cleanupGame({ gameId });
            io.emit(`endGame:${gameId}`);
        }
        });

        socket.on('startGame', async ({ gameId }) => {
            const players = await Games.getPlayersByGameId({ gameId });
            if (players.length >= 2) {
                io.to(`game:${gameId}`).emit('gameStarted', { gameId });
            } else {
                console.log("Too few players");
                socket.emit('tooFewPlayers', { message: "Too few players" });
            }
        });
    });

    app.io = io;
};

module.exports = init;
