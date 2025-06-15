// === ✅ Cleaned & Secure auth.js ===
const express = require("express");
const axios = require("axios");
const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

router.get("/github", (req, res) => {
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user repo`;
  res.redirect(githubAuthURL);
});

router.get("/github/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // 1. Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const githubToken = tokenRes.data.access_token;

    // 2. Get user details
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${githubToken}` },
    });

    const githubUsername = userRes.data.login;

    // 3. Save user info in session
    req.session.githubUser = {
      username: githubUsername,
      token: githubToken,
    };
    console.log("✅ Session set:", req.session.githubUser);

    // 4. Set an auth cookie
    res.cookie("github_token", githubToken, {
      httpOnly: true,
      secure: false, // ✅ true if using HTTPS in production
      sameSite: "Lax",
    });

    // 5. Redirect to frontend dashboard
    console.log("Hey lets redirect");
    return res.redirect(`${FRONTEND_URL}/dashboard`);
    console.log("redirected");
  } catch (err) {
    console.error("❌ GitHub OAuth callback error:", err.message);
    return res.redirect(`${FRONTEND_URL}/?error=login_failed`);
  }
});

module.exports = router;
