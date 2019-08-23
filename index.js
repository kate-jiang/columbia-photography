const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const https = require("https");
const fs = require("fs");
const async = require("async");

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const User = require("./models/User");
const Job = require("./models/Job");
const ClientSession = require("./models/ClientSession");

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
    submissionDate: new Date(),
    jobType: "event",
    clientName: `${firstName} ${lastName}`,
    clientFirstName: firstName,
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
    photographers: [],
    selectedPhotographer: { uni: "", firstName: "", lastName: "" },
    invoiceSent: false,
    portfoliosSent: false,
    releaseSent: false
  });

  job.save(err => {
    if (err) {
      res.status(500).send("Error creating job.");
    } else {
      res.status(200).send("Successfully created job.");
      const redirect = encodeURIComponent(`/drafts/${job._id}`);
      const mailOptions = {
           from: "columbiauniversityphoto@gmail.com",
           to: "columbiauniversityphoto@gmail.com",
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
  Job.find({ approved: true }).sort({ submissionDate: -1 }).exec((err, jobs) => {
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
  Job.findById(req.body.jobId, async (err, job) => {
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
          res.status(200).send("Successfully approved job.");
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

function generateInvoice(invoice, filename, success, error) {
    const postData = JSON.stringify(invoice);
    const options = {
        hostname  : "invoice-generator.com",
        port      : 443,
        path      : "/",
        method    : "POST",
        headers   : {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData)
        }
    };

    const file = fs.createWriteStream(filename);

    const req = https.request(options, function(res) {
        res.on('data', function(chunk) {
            file.write(chunk);
        })
        .on('end', function() {
            file.end();

            if (typeof success === 'function') {
                success();
            }
        });
    });
    req.write(postData);
    req.end();

    if (typeof error === 'function') {
        req.on('error', error);
    }
}

app.get("/api/jobs/:jobId/availablePhotographers", (req, res) => {
  Job.findById(req.params.jobId, async (err, job) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      let photographers = [];
      for (let i = 0; i < job.photographers.length; i++) {
        await User.findOne({uni: job.photographers[i]})
          .then(user => { photographers.push(user) });
      }
      res.status(200).send(photographers);
    }
  });
})

app.post("/api/invoice", withAdminAuth, (req, res) => {
  Job.findById(req.body.jobId, (err, job) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      const invoice = {
        to: `${job.clientName}\n${job.clientPhone}\n${job.clientEmail}`,
        currency: "usd",
        items: [
          {
            name: `Photography`,
            quantity: job.totalAmount / 120,
            unit_cost: 120
          },
        ],
        number: job.jobName,
        invoice_number_title: "",
        notes: "Thank you for your business!"
      }

      generateInvoice(invoice, 'invoice.pdf', function() {
        console.log("Saved invoice to invoice.pdf");
        const mailOptions = {
             from: "columbiauniversityphoto@gmail.com",
             to: job.clientEmail,
             subject: "[CPA] Invoice: " + job.jobName,
             html: `Hello,
                  <p>
                    Please find attached the invoice for ${job.jobName}.
                  </p>
                  <p>
                    Thanks!
                  </p>`,
             attachments: [
               {
                 filename: `${job.jobName}_invoice.pdf`,
                          contentType: 'application/pdf',
                 path: `./invoice.pdf`
               }
             ]
        };

        const smtpTransport = getTransporter();
        smtpTransport.sendMail(mailOptions, (error, response) => {
          error ? console.log(error) : console.log(response);
          smtpTransport.close();

          job.invoiceSent = true;
          job.save(err => {
            if (err) {
              res.status(500).send("Error saving job.");
            } else {
              res.status(200).send("Successfully saved job.");
            }
          });
        }, function(error) {
        console.error(error);
        });
      });
    }
  })
});

app.post("/api/sendPortfolios", withAdminAuth, (req, res) => {
  Job.findById(req.body.jobId, async (err, job) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      let portfolios = []
      for (let i = 0; i < job.photographers.length; i++) {
        await User.findOne({uni: job.photographers[i]})
          .then(user => {
            portfolios.push({ name: user.firstName + ' ' + user.lastName, link: user.defaultPortfolio})
          })
      }
      console.log(portfolios);

      const clientSession = new ClientSession({
        email: job.clientEmail
      });

      const client = await clientSession.save()

      const mailOptions = {
           from: "columbiauniversityphoto@gmail.com",
           to: job.clientEmail,
           subject: "[CPA] Available photographers for " + job.jobName,
           html: `Hello,
                <p>
                  Here are the photographers available for your shoot:
                </p>
                <ul>
                  ${portfolios.map(portfolio => `<li><a href="${portfolio.link}">${portfolio.name}</a></li>`).join('')}
                </ul>
                <p>
                  Please select who you would like to work with <a href="http://columbia-photography.herokuapp.com/${job._id}/${client._id}">here</a>.
                </p>
                <p>
                  Thanks!
                </p>`
      };

      const smtpTransport = getTransporter();
      smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        smtpTransport.close();

        job.portfoliosSent = true;
        job.save(err => {
          if (err) {
            res.status(500).send("Error saving job.");
          } else {
            res.status(200).send("Successfully saved job.");
          }
        });
      }, function(error) {
      console.error(error);
      });
     };
   })
})

app.get("/api/checkClient/:clientId", (req, res) => {
  Client.findById(req.params.clientId, (err, client) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else if (!client) {
      res.status(401).json({
        error: "Unauthorized"
      });
    } else {
      res.sendStatus(200);
    }
  })
})

app.post("/api/selectPhotographer", (req, res) => {
  Job.findById(req.body.jobId, (err, job) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      job.selectedPhotographer = req.body.selectedPhotographer;

      job.save(async err => {
        if (err) {
          res.status(500).send("Error saving job.");
        } else {
          oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
            access_token: (await oauth2Client.getAccessToken()).token
          });
          const drive = google.drive({version: 'v3', auth: oauth2Client});

          const fileMetadata = {
            'name': 'Invoices',
            'mimeType': 'application/vnd.google-apps.folder',
            parents: ['1PuoA6yHo5xAB8VgfrQ_4VARTOfbj0mpy']
          };
          drive.files.create({
            resource: fileMetadata,
            fields: 'id'
          }, function (err, file) {
            if (err) {
              // Handle error
              console.error(err);
            } else {
              const permissions = [
                { type: 'user', role: 'writer', emailAddress: job.clientEmail },
                { type: 'user', role: 'writer', emailAddress: job.selectedPhotographer.uni + "@columbia.edu" }
              ]

              async.eachSeries(permissions, function (permission, permissionCallback) {
                drive.permissions.create({
                  resource: permission,
                  fileId: file.data.id,
                  fields: 'id',
                }, function (err, res) {
                  if (err) {
                    // Handle error...
                    console.error(err);
                    permissionCallback(err);
                  } else {
                    console.log('Permission ID: ', res.data.id)
                    permissionCallback();
                  }
                });
              }, function (err) {
                if (err) {
                  // Handle error
                  console.error(err);
                } else {
                  // All permissions inserted
                }
              });

              const mailOptions = {
                   from: "columbiauniversityphoto@gmail.com",
                   to: job.clientEmail,
                   cc:  job.selectedPhotographer.uni + "@columbia.edu",
                   subject: "[CPA] " + job.jobName,
                   html: `Hi ${job.clientFirstName},
                        <p>
                          ${job.selectedPhotographer.firstName}, copied here, will be your photographer for this job.
                          Please discuess logistics such as meeting time and location on this thread.
                        </p>
                        <p>
                          <a href="https://drive.google.com/drive/u/0/folders/${file.data.id}">Here</a> is the Google Drive folder where the photos will be uploaded within one week of the shoot.
                        </p>
                        <p>
                        Feel free to reach out regarding any further concerns.
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
              res.status(200).send("Successfully saved job.");
            }
          });
        }
      });
    }
  })
})

app.post("/api/sendRelease", withAdminAuth, (req, res) => {
  Job.findById(req.body.jobId, (err, job) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again"
      });
    } else {
      const mailOptions = {
           from: "columbiauniversityphoto@gmail.com",
           to: job.selectedPhotographer.uni + "@columbia.edu",
           subject: "[CPA] Release Form for " + job.jobName,
           html: `Hello,
                <p>
                  Please complete the attached release form for ${job.jobName} to ensure timely payment.
                </p>
                <p>
                  Thanks!
                </p>`,
            attachments: [
              {
                filename: `${job.jobName}_release.pdf`,
                         contentType: 'application/pdf',
                path: `./Release.pdf`
              }
            ]
      };

      const smtpTransport = getTransporter();
      smtpTransport.sendMail(mailOptions, (error, response) => {
        error ? console.log(error) : console.log(response);
        smtpTransport.close();

        job.releaseSent = true;
        job.save(err => {
          if (err) {
            res.status(500).send("Error saving job.");
          } else {
            res.status(200).send("Successfully saved job.");
          }
        });
      }, function(error) {
      console.error(error);
      });
    }
  });
})

app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
