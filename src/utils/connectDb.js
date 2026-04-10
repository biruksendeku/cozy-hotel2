const mongoose = require("mongoose");
const { MONGODB_URI } = process.env;

const connectDb = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Database Connected");
  } catch (err) {
    console.log("Failed to connect to DB: ", err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
