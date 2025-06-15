const express = require("express");
const axios = require("axios");
const router = express.Router();

// GET /api/github/user
router.get("/user", async (req, res) => {
  const sessionUser = req.session.githubUser;

  if (!sessionUser || !sessionUser.token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${sessionUser.token}`,
      },
    });

    // ✅ Just forward the whole response data
    return res.json(userRes.data);
  } catch (err) {
    console.error("❌ Failed to fetch GitHub user info:", err.message);
    return res.status(500).json({ error: "Failed to fetch user info" });
  }
});

// GET /api/github/repos
router.get("/repos", async (req, res) => {
  const token = req.cookies.github_token;

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
