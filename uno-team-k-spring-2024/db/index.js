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

// Test the connection when starting up
testConnection();

module.exports = connection;
