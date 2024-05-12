const socket = io();
const loginForm = document.querySelector("#loginForm");
const chooseForm = document.querySelector("#choose-form");
const messageField = document.querySelector("#message-field");
const testButton = document.querySelector(".test-button");

if (loginForm) {
	loginForm.addEventListener("submit", (e) => {
		e.preventDefault();

		const formData = new FormData(loginForm);
		const values = [...formData.values()];

		if (values[0] === "" || values[0] === "") {
			alert("incorrect input!!!");
		} else {
			loginForm.submit(values);
		}
	});
}

if (chooseForm) {
	chooseForm.addEventListener("submit", (e) => {
		e.preventDefault();

		const formData = new FormData(chooseForm);
		const values = [...formData.values()];

		if (values.length === 4) {
			chooseForm.submit(values);
			values = [];
		} else {
			console.log("not enough arguments!");
		}
	});
}


if (testButton) {
	testButton.addEventListener("click", (e) => {
		// e.preventDefault();
		// add event listeners here
		console.log("test button clicked");
	});
}
