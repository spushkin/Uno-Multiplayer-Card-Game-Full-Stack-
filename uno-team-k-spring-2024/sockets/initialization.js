const socketIO = require("socket.io");

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

        socket.on("leaveGame", (gameId) => {
            socket.leave(`game:${gameId}`);
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
    });

    app.io = io;
};

module.exports = init;
