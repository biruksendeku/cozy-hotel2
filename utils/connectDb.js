const mongoose = require("mongoose");
const { MONGODB_URI } = process.env;

const connectDb = async () => {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("User Database Connected");
    })
    .catch((err) => {
      console.log("Failed to connect to DB: ", err.message);
      process.exit(1);
    });
};

module.exports = connectDb;
