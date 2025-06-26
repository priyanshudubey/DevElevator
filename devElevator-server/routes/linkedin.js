const express = require("express");
const multer = require("multer");
const LinkedInProfile = require("../models/LinkedInProfile");
const path = require("path");
const fs = require("fs");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads", "linkedin");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  },
});

const upload = multer({ storage });

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const mongoUserId = req.user._id.toString(); // ✅ Convert to string
    const filePath = req.file.path;
    const fileName = req.file.filename;

    await LinkedInProfile.create({ mongoUserId, filePath, fileName });

    res.json({ message: "Upload successful", fileName });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/status", async (req, res) => {
  const userId = req.user?.id; // Get from JWT/session
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const record = await LinkedInProfile.findOne({ where: { userId } });
    if (!record) return res.json({ uploaded: false });

    return res.json({ uploaded: true, fileName: record.filename });
  } catch (err) {
    console.error("Status check error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;
