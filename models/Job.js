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
  flexibleTime: {
    type: Boolean,
    required: true
  },
  date: {
    type: String,
    required: false
  },
  time: {
    type: String,
    required: false
  },
  flexibleTimeDetails: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: true
  },
  totalAmount: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  compensation: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  approved: {
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model("Job", JobSchema);
