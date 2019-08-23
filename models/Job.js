const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date,
    required: true
  },
  jobType: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientFirstName: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  compensation: {
    type: Number,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  approved: {
    type: Boolean,
    required: true
  },
  photographers: {
    type: [String],
    required: true
  },
  selectedPhotographer: {
    uni: String,
    firstName: String,
    lastName: String
  },
  invoiceSent: {
    type: Boolean,
    required: true
  },
  portfoliosSent: {
    type: Boolean,
    required: true
  },
  releaseSent: {
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model("Job", JobSchema);
