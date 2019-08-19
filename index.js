const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const User = require("./models/User");
const Job = require("./models/Job");
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

mongoose.connect(mongo_uri, { useCreateIndex: true, useNewUrlParser: true }, err => {
  if (err) {
    throw err;
  } else {
    console.log(`Successfully connected to database`);
  }
});

app.get("/api/checkToken", withAuth, (req, res) => {
  res.sendStatus(200);
});

app.get("/api/getUser", withAuth, (req, res) => {
  User.findOne({ uni: req.uni }, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      res.status(200).json({
        uni: req.uni,
        firstName: user.firstName,
        lastName: user.lastName
      });
    }
  });
});

app.post("/api/register", (req, res) => {
  const { uni, firstName, lastName, password } = req.body;
  const user = new User({ uni, firstName, lastName, password });
  user.save(err => {
    if (err) {
      res.status(500).send("Error registering new user.");
    } else {
      res.status(200).send("Registration successful.");
    }
  });
});

app.post("/api/authenticate", (req, res) => {
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

function calculatePayment(start, end, hourlyRate) {
    start = start.split(":");
    end = end.split(":");
    let startDate = new Date(0, 0, 0, start[0], start[1], 0);
    let endDate = new Date(0, 0, 0, end[0], end[1], 0);
    let diff = endDate.getTime() - startDate.getTime();
    let hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    let minutes = Math.floor(diff / 1000 / 60);

    return hours * hourlyRate + minutes / 60 * hourlyRate;
}


app.post("/api/createJob", (req, res) => {
  const { firstName, lastName, clientEmail,
          clientPhone, jobName, date, startTime,
          endTime, location, details } = req.body;
  const hourlyRate = 120;
  const totalAmount = calculatePayment(startTime, endTime, hourlyRate);
  const photographerCut = .85;

  const job = new Job({
    jobName,
    jobType: "event",
    clientName: `${firstName} ${lastName}`,
    clientEmail,
    clientPhone,
    date,
    startTime,
    endTime,
    time: moment(startTime, 'HH:mm').format('h:mm a') + ' - '
        + moment(endTime, 'HH:mm').format('h:mm a'),
    location,
    details,
    approved: false,
    totalAmount,
    compensation: totalAmount * photographerCut,
    photographers: []
  });

  job.save(err => {
    if (err) {
      res.status(500).send("Error creating job.");
    } else {
      res.status(200).send("Successfully created job.");
    }
  });
});

app.get("/api/jobs", withAuth, (req, res) => {
  Job.find((err, jobs) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      res.status(200).send(jobs);
    }
  })
})

app.post("/api/applyToJob", withAuth, (req, res) => {
  Job.findById(req.body.jobId, (err, job) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      if (!job.photographers.includes(req.uni)) {
        job.photographers = job.photographers.concat([req.uni]);
      }
      job.save(err => {
        if (err) {
          console.log(err)
          res.status(500).send("Error applying to job.");
        } else {
          res.status(200).send("Successfully applied to job.");
        }
      });
    }
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
