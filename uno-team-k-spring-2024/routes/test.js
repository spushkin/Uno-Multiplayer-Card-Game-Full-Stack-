var express = require("express");
var router = express.Router();

/* GET demo page. */
router.get("/start", function (request, response, next) {
	const { username } = request.session;
	response.render("demo", { username, title: "Demo" });
});

module.exports = router;
