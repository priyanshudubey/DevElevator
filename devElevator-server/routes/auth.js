const express = require("express");
const axios = require("axios");
const router = express.Router();

const User = require("../models/User");

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Step 1: Redirect to GitHub
router.get("/github", (req, res) => {
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email repo`;
  res.redirect(githubAuthURL);
});

router.get("/github/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      },
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "DevElevator-App",
        },
      }
    );

    const githubToken = tokenRes.data.access_token;
    if (!githubToken) throw new Error("No access token received");
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const emailRes = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const githubUsername = userRes.data.login;
    let githubEmail = userRes.data.email;

    if (!githubEmail && Array.isArray(emailRes.data)) {
      const primaryEmail = emailRes.data.find((e) => e.primary && e.verified);
      githubEmail = primaryEmail ? primaryEmail.email : null;
    }
    if (!githubEmail)
      githubEmail = `${githubUsername}@users.noreply.github.com`;

    if (!githubEmail) throw new Error("GitHub email not available");

    // Step 5: Find or create user in DB
    let user = await User.findOne({ email: githubEmail });
    if (!user) {
      user = await User.create({
        email: githubEmail,
        name: githubUsername,
        githubProfile: userRes.data,
      });
    } else {
      // Optionally update the profile on login
      user.githubProfile = userRes.data;
      await user.save();
    }
    req.session.userId = user._id;
    req.session.githubUser = {
      username: githubUsername,
      token: githubToken, // ✅ required for authenticated GitHub API calls
    };

    return res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    if (err.response) {
      console.error(
        "❌ GitHub Response Error:",
        err.response.status,
        err.response.data
      );
    } else {
      console.error("❌ GitHub OAuth callback error:", err.message);
    }
    res.status(500).send("Authentication failed");
  }
});

router.get("/status", (req, res) => {
  if (req.session.userId) {
    console.log("✅ Authenticated session");
    console.log("Session ID:", req.sessionID);
    console.log("User ID:", req.session.userId);
    return res.json({ loggedIn: true });
  } else {
    console.log("❌ Not logged in");
    return res.json({ loggedIn: false });
  }
});
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("develevator.sid");
    res.json({ success: true });
  });
});

module.exports = router;
