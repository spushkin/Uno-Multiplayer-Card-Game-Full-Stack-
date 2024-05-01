var express = require("express");
var router = express.Router();

/* GET demo page. */
router.get("/start", function (req, res, next) {
	res.render("demo", { title: "TEST" });
});

module.exports = router;
