const mongoose = require("mongoose");

const ClientSessionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model("ClientSession", ClientSessionSchema);
