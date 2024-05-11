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

        // Handle game-specific chat messages
        socket.on("chatMessage", (data) => {
            const { gameId, message } = data;
            const { username } = socket.request.session;
            const timestamp = Date.now();

            // Broadcast message to all members of the game
            io.to(`game:${gameId}`).emit("chatMessage", {
                sender: username,
                message,
                timestamp,
            });
        });
        
        socket.on('startGame', ({ gameId }) => {
            // Perform validation and start the game
            io.to(`game:${gameId}`).emit('gameStarted', { gameId });
        });
    });

    app.io = io;
};

module.exports = init;
