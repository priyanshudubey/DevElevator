const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/generate", async (req, res) => {
  const { name, email, title, skills, repos } = req.body;

  if (!name || !title || !skills || !repos) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const repoSummary = repos
    .map(
      (repo) =>
        `• ${repo.name}: ${repo.description || "No description"} (${
          repo.language || "Unknown"
        })`
    )
    .join("\n");

  const prompt = `
You're a world-class tech recruiter. Based on the data below, generate a professional 1-page resume in plain text format for a developer.

Name: ${name}
Email: ${email}
Title: ${title}
Skills: ${skills.join(", ")}

Top GitHub Projects:
${repoSummary}

Only return resume content. Do not include any extra notes.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resume = completion.choices[0].message.content.trim();
    res.json({ resume });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate resume" });
  }
});

module.exports = router;
