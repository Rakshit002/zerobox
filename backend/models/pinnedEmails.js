const mongoose = require("mongoose");

const pinnedEmailSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  emailId: {
    type: String,
    required: true
  }

});

module.exports = mongoose.model("PinnedEmail", pinnedEmailSchema);