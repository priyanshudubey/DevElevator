const express = require("express");
const axios = require("axios");
const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

router.get("/github", (req, res) => {
  console.log("Client ID:", CLIENT_ID);
  console.log("Redirect URI:", REDIRECT_URI);
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user repo`;
  res.redirect(githubAuthURL);
});

router.get("/github/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const userData = userResponse.data;

    // Optional: Save user to DB

    res.cookie("token", accessToken, { httpOnly: true });
    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth Failed");
  }
});

module.exports = router;
