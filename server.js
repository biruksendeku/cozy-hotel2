require("dotenv").config({ path: "./.env" });

const connectDb = require("./src/utils/connectDb");
connectDb();

const app = require("./src/app");
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}...`);
});
