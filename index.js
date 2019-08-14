const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("./models/User.js");
const withAuth = require("./middleware");

const secret = process.env.secret;

const app = express();
app.use(cors());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, "client/build")));

const mongo_uri = process.env.MONGODB_URI;

mongoose.connect(mongo_uri, { useNewUrlParser: true }, err => {
  if (err) {
    throw err;
  } else {
    console.log(`Successfully connected to database`);
  }
});

app.get("/checkToken", withAuth, (req, res) => {
  res.sendStatus(200);
});

app.post("/register", (req, res) => {
  const { uni, password } = req.body;
  const user = new User({ uni, password });
  user.save(err => {
    if (err) {
      res.status(500).send("Error registering new user.");
    } else {
      res.status(200).send("Registration successful.");
    }
  });
});

app.post("/authenticate", (req, res) => {
  const { uni, password } = req.body;
  User.findOne({ uni }, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else if (!user) {
      res.status(401).json({
        error: "Incorrect email or password"
      });
    } else {
      user.isCorrectPassword(password, (err, same) => {
        if (err) {
          res.status(500).json({
            error: "Internal error please try again"
          });
        } else if (!same) {
          res.status(401).json({
            error: "Incorrect email or password"
          });
        } else {
          // Issue token
          const payload = { uni };
          const token = jwt.sign(payload, secret, {
            expiresIn: "1h"
          });
          res.cookie("token", token, { httpOnly: true }).sendStatus(200);
        }
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
