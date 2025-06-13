const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/user", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(userRes.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GitHub user fetch failed" });
  }
});

router.get("/repos", async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const reposRes = await axios.get(
      "https://api.github.com/user/repos?per_page=100",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Optional: sort by updated_at or stargazers_count
    const sortedRepos = reposRes.data.sort(
      (a, b) => b.stargazers_count - a.stargazers_count
    );

    res.json(sortedRepos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "GitHub repos fetch failed" });
  }
});

module.exports = router;
