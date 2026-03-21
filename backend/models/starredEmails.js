import mongoose from "mongoose";

const starredEmailSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  emailId: {
    type: String,
    required: true
  }

});

export default mongoose.model("StarredEmail", starredEmailSchema);
