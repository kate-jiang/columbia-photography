const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  jobName: {
    type: String,
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
  approved: {
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model("Job", JobSchema);
