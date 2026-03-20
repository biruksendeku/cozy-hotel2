require("dotenv").config();

const mongoose = require("mongoose");
const connectDb = require("./src/utils/connectDb");
connectDb();

const app = require("./src/app");
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});

let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log(`${signal} received. Shutting down...`);

  server.close(async (error) => {
    if (error) {
      console.error("Failed to close server:", error);
      process.exitCode = 1;
    }

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error("Failed to close database connection:", closeError);
      process.exitCode = 1;
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
