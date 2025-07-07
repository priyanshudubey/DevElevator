const mongoose = require("mongoose");

const linkedInProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // One LinkedIn profile per user
  },
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  ftpPath: {
    type: String,
    required: true, // Path on Hostinger FTP server
  },
  ftpUrl: {
    type: String,
    required: true, // Direct URL to access the file
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LinkedInProfile", linkedInProfileSchema);
