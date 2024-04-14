const express = require("express");

const router = express.Router();

router.get("/", (request, response) => {
	const { username, userId } = request.session;

	response.render("home", { username, userId, title: "home" });
});

module.exports = router;
