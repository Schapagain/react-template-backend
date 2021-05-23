const app = require("./app");
const { sequelize } = require("./database/models");
const server = require("http").createServer(app);

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("Connected to database..."))
  .catch((err) => console.error("Database connection failed: ", err.message));

// Start the server and listen on port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Listening on port", PORT));
