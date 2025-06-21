const mongoose = require("mongoose");

const structureSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  repoName: { type: String, required: true },
  owner: { type: String, required: true },
  structure: { type: Object, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7, // Auto-delete after 7 days (TTL)
  },
});

module.exports = mongoose.model("Structure", structureSchema);
