const express = require("express");
const cors = require("cors");
const app = express();

const path = require("path");

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "client/build")));

app.get("/text", async (req, res, next) => {
  try {
    res.json({ text: "Hello" });
  } catch (err) {
    next(err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
