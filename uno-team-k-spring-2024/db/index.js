require("dotenv").config();
const pgp = require("pg-promise")();
const connection = pgp(process.env.DATABASE_URL);

async function testConnection() {
	try {
		// Try to acquire a connection from the pool
		const db = await connection.connect();
		db.done(); // Release the connection back to the pool
		console.log("Connected to the database");
	} catch (error) {
		console.error("Error connecting to the database:", error.message);
	}
}

const cleanUpGames = async () => {
	try {
		// Start a transaction
		await connection.tx(async (t) => {
			// Execute multiple queries within the transaction
			await t.none("DELETE FROM games");
			await t.none("DELETE FROM game_cards");
			await t.none("DELETE FROM game_users");
		});
		console.log("All specified tables cleared successfully");
	} catch (error) {
		console.error("Error clearing tables:", error);
	}
};

// Test the connection when starting up
testConnection();

// Execute the cleanup function on startup
// cleanUpGames();

module.exports = connection;
