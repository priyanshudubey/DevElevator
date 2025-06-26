require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");
const router = express.Router();
const updateUsageReset = require("../middleware/usageLimiter");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/generate", updateUsageReset, async (req, res) => {
  const { repoName, owner } = req.body;

  if (!repoName || !owner)
    return res.status(400).json({ error: "Repo name and owner required" });

  try {
    const user = req.user;
    if (process.env.NODE_ENV === "development") {
      req.user.usage.readmeCount = 0;
    }

    // ❌ Check rate limit
    if (user.usage.readmeCount >= 10) {
      const timeLeft =
        6 * 60 * 60 * 1000 - (new Date() - user.usage.readmeResetAt);
      const secondsLeft = Math.floor(timeLeft / 1000);

      return res.status(429).json({
        error: "You've reached the daily limit for README generation 🧨",
        retryAfter: secondsLeft,
      });
    }

    const contentsUrl = `https://api.github.com/repos/${owner}/${repoName}/contents`;

    const { data: files } = await axios.get(contentsUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const importantFiles = files.filter((file) =>
      [
        "README.md",
        "package.json",
        "index.js",
        "server.js",
        "main.py",
        "app.js",
        "requirements.txt",
      ].includes(file.name)
    );

    let fileSummaries = "";

    if (importantFiles.length === 0) {
      fileSummaries = "No significant file content found.";
    } else {
      for (const file of importantFiles) {
        const fileContentRes = await axios.get(file.download_url);
        fileSummaries += `\n\n### ${file.name}\n\n\`\`\`\n${fileContentRes.data}\n\`\`\``;
      }
    }

    const prompt = `
You are a professional technical writer.

Your task is to write a brand-new, clean, and professional README.md file for a GitHub repository named "${repoName}" owned by "${owner}". The README should include the following sections (if applicable):
- Project Title and Short Description
- Table of Contents
- Features
- Technologies Used
- Installation Instructions
- Usage Guide
- Screenshots (use markdown image links if needed)
- Contributing Guidelines
- License
- Contact Info

Do not review or critique the content. Just generate the best possible README from scratch using the following project files:

${fileSummaries}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert open source README generator.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
    });

    const aiReadme = completion.choices[0].message.content;

    // ✅ Update user's usage
    user.usage.readmeCount += 1;
    await user.save();

    res.json({
      readme: aiReadme,
      remaining: 3 - user.usage.readmeCount,
    });
  } catch (err) {
    console.error("README generation failed:", err.response?.data || err);
    res.status(500).json({ error: "Failed to generate README" });
  }
});

module.exports = router;
