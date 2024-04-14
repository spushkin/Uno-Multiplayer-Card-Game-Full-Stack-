const express = require("express");

const router = express.Router();

router.get("/", (request, response) => {
	const { username, userId } = request.session;

	response.render("homePage", { username, userId, title: "homePage" });
});

module.exports = router;
