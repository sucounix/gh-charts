const express = require("express");
const cors = require("cors");
const process = require("process");

const router = require("./routes/router");

const app = express();

app.use(cors());
app.use(express.json());

require("dotenv").config();
require("newrelic");

const PORT = process.env.PORT || 80;

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server is succesfully running on port ${PORT} ✅`);
});

module.exports = app;
