const express = require("express");

const router = express.Router();

router.get("/", (request, response) => {
	const { username, userId } = request.session;

	response.render("home", { username, userId, title: "home" });
});

router.get("/join/test", (request, response) => {
	const { username, userId } = request.session;

	response.render("demo", { username, userId, title: "demo" });
});

router.get("/join/test-private", (request, response) => {
	const { username, userId } = request.session;

	response.render("demo", { username, userId, title: "demo" });
});

module.exports = router;
