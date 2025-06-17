const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const path = require("path");
const simpleGit = require("simple-git");
const os = require("os");

router.post("/tree", async (req, res) => {
  const { repoName, owner } = req.body;

  if (!repoName || !owner) {
    return res.status(400).json({ error: "Missing repoName or owner" });
  }

  const repoUrl = `https://github.com/${owner}/${repoName}.git`;
  const tempDir = path.join(os.tmpdir(), `devElevator-${Date.now()}`);

  try {
    await simpleGit().clone(repoUrl, tempDir);

    const buildTree = async (dirPath) => {
      const items = await fs.readdir(dirPath);
      const tree = await Promise.all(
        items.map(async (item) => {
          const fullPath = path.join(dirPath, item);
          const stats = await fs.stat(fullPath);
          if (stats.isDirectory()) {
            return {
              name: item,
              type: "dir",
              children: await buildTree(fullPath),
            };
          } else {
            return {
              name: item,
              type: "file",
            };
          }
        })
      );
      return tree;
    };

    const structure = await buildTree(tempDir);
    res.json({ tree: structure });
  } catch (error) {
    console.error("Error generating structure:", error);
    res.status(500).json({ error: "Failed to generate structure" });
  } finally {
    fs.remove(tempDir); // clean up
  }
});

module.exports = router;
