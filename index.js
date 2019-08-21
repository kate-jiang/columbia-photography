const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const User = require("./models/User");
const Job = require("./models/Job");
const { withAuth, withAdminAuth } = require("./middleware");

const secret = process.env.secret;

const oauth2Client = new OAuth2(
     process.env.GOOGLE_CLIENT_ID, // ClientID
     process.env.GOOGLE_CLIENT_SECRET, // Client Secret
     "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const getTransporter = () => {
  const accessToken = oauth2Client.getAccessToken()
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: "columbiauniversityphoto@gmail.com",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken
    }
  });

  return smtpTransport;
}

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

app.get("/api/checkAdminToken", withAdminAuth, (req, res) => {
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
        lastName: user.lastName,
        defaultPortfolio: user.defaultPortfolio,
        eventPortfolio: user.eventPortfolio,
        portraitPortfolio: user.portraitPortfolio
      });
    }
  });
});

app.post("/api/register", (req, res) => {
  const { uni, firstName, lastName, admin, password } = req.body;
  const user = new User({ uni, firstName, lastName, admin, password });
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
          const payload = { uni, admin: user.admin };
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
    // TODO: deal with overlapping past midnight
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
      const redirect = encodeURIComponent(`/drafts/${job._id}`);
      const mailOptions = {
           from: "columbiauniversityphoto@gmail.com",
           to: "kyj2108@columbia.edu",
           subject: "[CPA] New Job Request: " + job.jobName,
           html: `Hi everyone, here's a new job request:
                <p>
                  <strong>Client:</strong> ${job.clientName}<br/>
                  <strong>Email:</strong> ${job.clientEmail}<br/>
                  <strong>Phone:</strong> ${job.clientPhone}<br/>
                </p>
                <p>
                  <b>Date:</b> ${job.date}<br/>
                  <b>Time:</b> ${job.time}<br/>
                  <b>Location:</b> ${job.location}<br/>
                  <b>Total Amount:</b> $${job.totalAmount}<br/>
                  <b>Details:</b> ${job.details}<br/>
                </p>
                <p>
                  Edit and approve this job on the
                  <a href="http://columbia-photography.herokuapp.com/login?redirect=${redirect}">CPA portal.</a>
                </p>
                <p>
                  Thanks!
                </p>`
      };

      const smtpTransport = getTransporter();
      smtpTransport.sendMail(mailOptions, (error, response) => {
           error ? console.log(error) : console.log(response);
           smtpTransport.close();
      });
    }
  });
});

app.get("/api/jobs", withAuth, (req, res) => {
  Job.find({ approved: true }, (err, jobs) => {
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

app.get("/api/drafts", withAdminAuth, (req, res) => {
  Job.find({ approved: false }, (err, jobs) => {
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

app.get("/api/jobs/:jobId", withAuth, (req, res) => {
  Job.findById(req.params.jobId, (err, job) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      res.status(200).send(job);
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
          res.status(500).send("Error applying to job.");
        } else {
          res.status(200).send("Successfully applied to job.");
        }
      });
    }
  })
})

app.post("/api/withdrawFromjob", withAuth, (req, res) => {
  Job.findById(req.body.jobId, (err, job) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      job.photographers = job.photographers.filter(uni => uni !== req.uni)
      job.save(err => {
        if (err) {
          console.log(err)
          res.status(500).send("Error withdrawing from job.");
        } else {
          res.status(200).send("Successfully withdrew from job.");
        }
      });
    }
  })
})

app.post("/api/updateJob", withAdminAuth, (req, res) => {
  Job.findById(req.body.jobId, (err, job) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      job.jobName = req.body.jobName,
      job.date = req.body.date,
      job.time = req.body.time,
      job.location = req.body.location,
      job.details = req.body.details,
      job.compensation = req.body.compensation
      job.save(err => {
        if (err) {
          res.status(500).send("Error approving job.");
        } else {
          res.status(200).send("Successfully approve job.");
        }
      });
    }
  })
})

app.post("/api/approveJob", withAdminAuth, (req, res) => {
  Job.findById(req.body.jobId, (err, job) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      job.approved = true;
      job.save(err => {
        if (err) {
          res.status(500).send("Error approving job.");
        } else {
          res.status(200).send("Successfully approve job.");
          const redirect = encodeURIComponent(`/jobs/${job._id}`);
          const mailOptions = {
               from: "columbiauniversityphoto@gmail.com",
               to: "kyj2108@columbia.edu",
               subject: "[CPA] Job Opportunity: " + job.jobName,
               html: `Hi everyone, here's a new job:
                    <p>
                      <b>Name:</b> ${job.jobName}<br/>
                      <b>Date:</b> ${job.date}<br/>
                      <b>Time:</b> ${job.time}<br/>
                      <b>Location:</b> ${job.location}<br/>
                      <b>Compensation:</b> $${job.compensation}<br/>
                      <b>Details:</b> ${job.details}<br/>
                    </p>
                    <p>
                      Apply for this job through the
                      <a href="http://columbia-photography.herokuapp.com/login?redirect=${redirect}">CPA portal.</a>
                    </p>
                    <p>
                      Thanks!
                    </p>`
          };

          const smtpTransport = getTransporter();
          smtpTransport.sendMail(mailOptions, (error, response) => {
               error ? console.log(error) : console.log(response);
               smtpTransport.close();
          });
        }
      });
    }
  })
})

app.post("/api/unapproveJob", withAdminAuth, (req, res) => {
  Job.findById(req.body.jobId, (err, job) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      job.approved = false;
      job.save(err => {
        if (err) {
          res.status(500).send("Error unapproving job.");
        } else {
          res.status(200).send("Successfully unapproved job.");
        }
      });
    }
  })
})

app.post("/api/updateUser", withAuth, (req, res) => {
  const { firstName, lastName, defaultPortfolio, portraitPortfolio, eventPortfolio } = req.body;
  User.findOne({ uni: req.uni }, (err, user) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      user.firstName = firstName;
      user.lastName = lastName;
      user.defaultPortfolio = defaultPortfolio;
      user.portraitPortfolio = portraitPortfolio;
      user.eventPortfolio = eventPortfolio;

      user.save(err => {
        if (err) {
          console.log(err)
          res.status(500).send("Error saving settings.");
        } else {
          res.status(200).send("Successfully saved settings.");
        }
      });
    }
  })
})

app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
