const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  createdAt: { type: Date, default: Date.now },
  githubProfile: mongoose.Schema.Types.Mixed,
  usage: {
    readmeCount: { type: Number, default: 0 },
    readmeResetAt: { type: Date, default: Date.now },
    structureCount: { type: Number, default: 0 },
    structureResetAt: { type: Date, default: Date.now },
  },
});

module.exports = mongoose.model("User", userSchema);
