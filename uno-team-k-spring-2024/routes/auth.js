const express = require("express");
const router = express.Router();
const Users = require("../db/users");

/* GET  pages. */
router.get("/register", function (request, response, next) {
	response.render("register", { title: "Register" });
});

router.get("/login", function (request, response, next) {
	response.render("login", { title: "Login" });
});

/* POST  methods. */
router.post("/login", (request, response) => {
	const { username, password } = request.body;

	Users.login({ username, password })
		.then(handleLogin(request, response))
		.catch(handleLoginError(response, "/auth/login"));
});

router.post("/register", (request, response) => {
	const { username, email, password } = request.body;

	Users.register({ username, email, password })
		.then(handleLogin(request, response))
		.catch(handleLoginError(response, "/auth/register"));
});

/* helpers */
const handleLogin =
	(request, response) =>
	({ id, username }) => {
		request.session.authenticated = true;
		request.session.userId = id;
		request.session.username = username;

		response.redirect("/home");
	};

const handleLoginError = (response, redirectUri) => (error) => {
	console.log({ error });
	response.redirect(redirectUri);
};

/* GET logout page. */
router.get("/logout", function (request, response, next) {
	if (request.session) {
		request.session.destroy((err) => {
			if (err) {
				console.log({ err });
				next(err);
			}

			response.redirect("/auth/login");
		});
	} else {
		console.log("user not logged in");
		response.redirect("/auth/login");
	}
});

module.exports = router;
