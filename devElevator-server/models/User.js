const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  createdAt: { type: Date, default: Date.now },
  githubProfile: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("User", userSchema);
