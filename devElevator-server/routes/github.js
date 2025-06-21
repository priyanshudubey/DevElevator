const express = require("express");
const axios = require("axios");
const router = express.Router();
const requireAuth = require("../middleware/auth");

// GET /api/github/user
router.get("/user", requireAuth, (req, res) => {
  // Now req.user is always populated from DB
  // console.log("User authenticated:", req.user);

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    githubUsername: req.user.githubProfile?.login, // from githubProfile
    avatar_url: req.user.githubProfile?.avatar_url,
    followers: req.user.githubProfile?.followers,
    following: req.user.githubProfile?.following,
    public_repos: req.user.githubProfile?.public_repos,
    githubProfile: req.user.githubProfile, // send full profile if you want
  });
});

// GET /api/github/repos
router.get("/repos", async (req, res) => {
  const token = req.session.githubUser?.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const reposRes = await axios.get(
      "https://api.github.com/user/repos?per_page=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const sortedRepos = reposRes.data.sort(
      (a, b) => b.stargazers_count - a.stargazers_count
    );

    return res.status(200).json(sortedRepos);
  } catch (err) {
    console.error("GitHub repos fetch error:", err.message);
    return res.status(500).json({ error: "GitHub repos fetch failed" });
  }
});
module.exports = router;
