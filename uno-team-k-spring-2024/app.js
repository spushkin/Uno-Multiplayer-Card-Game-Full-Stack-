const protect = require("./app-config/protect");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const sessionInstance = require("./app-config/session");

if (process.env.NODE_ENV === "development") {
	require("dotenv").config();
}

const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const homeRouter = require("./routes/home");
const chatRouter = require("./routes/chat");
const testRouter = require("./routes/test");
const playRouter = require("./routes/play");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(sessionInstance);

// public
app.use("/users", usersRouter);
app.use("/auth", authRouter);

// protected
app.use("/home", protect, homeRouter);
app.use("/chat", protect, chatRouter);
app.use("/test", protect, testRouter);
app.use("/play", protect, playRouter);



// home router
app.use("/*", protect, homeRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
