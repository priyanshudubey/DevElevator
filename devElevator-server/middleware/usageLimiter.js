const User = require("../models/User");
require("dotenv").config();

const updateUsageReset = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const now = new Date();

    // Reset README counter if 24hrs passed
    if (now - user.usage.readmeResetAt > 6 * 60 * 60 * 1000) {
      user.usage.readmeCount = 0;
      user.usage.readmeResetAt = now;
    }

    // Reset Structure counter if 24hrs passed
    if (now - user.usage.structureResetAt > 6 * 60 * 60 * 1000) {
      user.usage.structureCount = 0;
      user.usage.structureResetAt = now;
    }

    // Development bypass - reset counters
    if (process.env.NODE_ENV === "development") {
      user.usage.readmeCount = 0;
      user.usage.structureCount = 0;
    }

    await user.save();

    req.user = user;
    next();
  } catch (err) {
    console.error("Usage limiter error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateUsageReset;
