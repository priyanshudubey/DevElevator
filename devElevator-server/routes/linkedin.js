const express = require("express");
const multer = require("multer");
const LinkedInProfile = require("../models/LinkedInProfile");
const ftpService = require("../services/ftpService");
const rateLimitService = require("../services/rateLimitService");
const path = require("path");
const fs = require("fs");
const requireAuth = require("../middleware/auth");
const { OpenAI } = require("openai");
const pdfParse = require("pdf-parse");
const axios = require("axios");

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Function to extract text from PDF
const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

// ✅ Function to download PDF from FTP
const downloadPDFFromFTP = async (ftpUrl) => {
  try {
    const response = await axios.get(ftpUrl, {
      responseType: "arraybuffer",
      timeout: 30000, // 30 seconds timeout
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error("FTP download error:", error);
    throw new Error("Failed to download PDF from server");
  }
};

// Configure multer for temporary local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "temp");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // ✅ Fixed the missing closing parenthesis
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
      file.originalname
    }`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// Upload route
router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.user._id;
    tempFilePath = req.file.path;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;

    // Generate unique filename for FTP
    const fileExtension = path.extname(originalName);
    const uniqueFileName = `${userId}-${Date.now()}${fileExtension}`;

    // Check if user already has a LinkedIn profile
    const existingProfile = await LinkedInProfile.findOne({ userId });

    // If exists, delete the old file from FTP
    if (existingProfile) {
      try {
        await ftpService.deleteFile(existingProfile.ftpPath);
      } catch (error) {
        console.warn(
          "Warning: Could not delete old file from FTP:",
          error.message
        );
      }
      await LinkedInProfile.deleteOne({ userId });
    }

    // Upload to FTP
    console.log("Uploading to FTP...");
    const ftpResult = await ftpService.uploadFile(tempFilePath, uniqueFileName);

    // Save to MongoDB
    const linkedInProfile = new LinkedInProfile({
      userId,
      fileName: uniqueFileName,
      originalName,
      ftpPath: ftpResult.ftpPath,
      ftpUrl: ftpResult.ftpUrl,
      fileSize,
    });

    await linkedInProfile.save();

    console.log("✅ LinkedIn profile uploaded successfully");

    res.json({
      message: "Upload successful",
      fileName: uniqueFileName,
      url: ftpResult.ftpUrl,
    });
  } catch (error) {
    console.error("Upload failed:", error);

    if (error.message && error.message.includes("PDF")) {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    if (error.message && error.message.includes("FTP")) {
      return res
        .status(500)
        .json({ error: "Failed to upload to server. Please try again." });
    }

    res.status(500).json({ error: "Upload failed. Please try again." });
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log("🧹 Temporary file cleaned up");
      } catch (error) {
        console.warn(
          "Warning: Could not delete temporary file:",
          error.message
        );
      }
    }
  }
});

// Status route
router.get("/status", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await LinkedInProfile.findOne({ userId });

    if (!profile) {
      return res.json({ uploaded: false });
    }

    return res.json({
      uploaded: true,
      fileName: profile.fileName,
      originalName: profile.originalName,
      ftpUrl: profile.ftpUrl,
      uploadedAt: profile.uploadedAt,
      fileSize: profile.fileSize,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({ error: "Failed to check status" });
  }
});

// Remove route
router.delete("/remove", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await LinkedInProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: "No file found" });
    }

    // Delete from FTP
    try {
      await ftpService.deleteFile(profile.ftpPath);
    } catch (error) {
      console.warn("Warning: Could not delete file from FTP:", error.message);
    }

    // Delete from MongoDB
    await LinkedInProfile.deleteOne({ userId });

    res.json({ message: "File removed successfully" });
  } catch (error) {
    console.error("Remove failed:", error);
    res.status(500).json({ error: "Failed to remove file" });
  }
});

// Preview route
router.get("/preview/:fileName", requireAuth, async (req, res) => {
  try {
    const { fileName } = req.params;
    const userId = req.user._id;

    const profile = await LinkedInProfile.findOne({
      userId,
      fileName,
    });

    if (!profile) {
      return res.status(404).json({ error: "File not found" });
    }

    res.redirect(profile.ftpUrl);
  } catch (error) {
    console.error("Preview error:", error);
    res.status(500).json({ error: "Failed to preview file" });
  }
});

// ✅ Simplified Optimize route - return structured data
router.post("/optimize", requireAuth, async (req, res) => {
  try {
    const { fileName } = req.body;
    const userId = req.user._id.toString();

    console.log(
      `🚀 Starting LinkedIn optimization for user ${userId}, file: ${fileName}`
    );

    // Check rate limit using RateLimitService
    const rateLimitResult = rateLimitService.checkLimit(userId, "linkedin");
    if (rateLimitResult.limited) {
      return res.status(429).json({
        error: "Rate limit reached",
        linkedinResetAt: rateLimitResult.resetAt,
        message:
          "You've reached the optimization limit. Please try again later.",
        remaining: rateLimitResult.remaining,
      });
    }

    // Find the user's LinkedIn profile
    const profile = await LinkedInProfile.findOne({ userId, fileName });

    if (!profile) {
      return res.status(404).json({ error: "LinkedIn profile not found" });
    }

    console.log(`📄 Found profile: ${profile.originalName}`);

    // Download and parse PDF
    console.log("📥 Downloading PDF from FTP...");
    const pdfBuffer = await downloadPDFFromFTP(profile.ftpUrl);

    console.log("🔍 Extracting text from PDF...");
    const extractedText = await extractTextFromPDF(pdfBuffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        error: "Could not extract text from PDF",
        message:
          "The PDF might be image-based or corrupted. Please try uploading a text-based PDF.",
      });
    }

    console.log(`✅ Extracted ${extractedText.length} characters from PDF`);

    // ✅ Simple, clean prompt for structured response
    const prompt = `
You are a professional LinkedIn optimization expert and career coach. Analyze the following LinkedIn profile content and provide comprehensive, actionable optimization recommendations in **valid JSON format** as specified below. 

🔴 **Important Instructions:**
- Extract information ONLY from the provided content. Do NOT assume or invent any data not present.
- Keep recommendations clear, concise, and professional.
- For each section, provide:
  - The complete **current text** (extracted from input, mention "Not provided" if absent)
  - The complete **rewritten, optimised version** ready to copy-paste into LinkedIn
- DO NOT provide generic suggestions like "use more action verbs" or "quantify achievements". Instead, directly rewrite the sections using these principles.
- Use powerful, positive language to motivate the user.
- Return output ONLY as a **valid minified JSON object** with no explanations or markdown.

LINKEDIN PROFILE CONTENT:
${extractedText}

Please return the output strictly in the following JSON structure:

{
  "profileOverview": {
    "score": "X/10",
    "summary": "Overall summary assessment in 2-3 lines."
  },
  "headline": {
    "current": "Extracted current headline or 'Not provided'",
    "optimized": "Complete, concise, keyword-rich improved headline"
  },
  "about": {
    "current": "Extracted current About section or 'Not provided'",
    "optimized": "Complete, professionally rewritten, impactful About section"
  },
  "experience": [
    {
      "role": "Role Title at Company Name",
      "current": "Extracted current experience description or 'Not provided'",
      "optimized": "Professionally rewritten, achievement-focused, ATS-friendly version for this role"
    }
    // Repeat for each role found in experience section
  ],
  "skills": {
    "current": ["List","of","current","skills","or","Not provided"],
    "optimized": ["Cleaned","prioritised","keyword-rich","skills","list","for","LinkedIn"]
  },
  "seo": {
    "currentKeywords": "Summary of current keyword usage",
    "optimizedStrategy": "Short summary of how rewritten sections improve keyword density and searchability"
  },
  "branding": {
    "current": "Summary of what the current profile communicates",
    "optimized": "Clear, concise professional brand summary after all optimisations"
  },
  "actionPlan": [
    "Most impactful change implemented",
    "Second most impactful change implemented",
    "Third most impactful change implemented"
    // Up to 7 as needed
  ],
  "finalNote": "Short motivational statement encouraging the user to implement these changes confidently to enhance their LinkedIn visibility and personal brand."
}

Return only the above JSON object with no additional text or explanation. Ensure it is valid and minified for direct parsing.
`;

    console.log("🤖 Sending to OpenAI for analysis...");

    // Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert LinkedIn optimization consultant. Respond with valid JSON only. Extract information strictly from the provided content without inventing details.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3500,
    });

    let optimizedData;
    try {
      // Parse the JSON response
      optimizedData = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      return res.status(500).json({
        error: "AI response parsing failed",
        message: "Received invalid response format. Please try again.",
      });
    }

    console.log("✅ OpenAI analysis completed");

    // Update rate limit counter
    rateLimitService.updateLimit(userId, "linkedin");

    // Get updated rate limit info
    const updatedRateLimit = rateLimitService.checkLimit(userId, "linkedin");

    console.log(`✅ LinkedIn optimization completed for user ${userId}`);

    res.json({
      optimizedData, // Structured data instead of raw text
      linkedinResetAt: updatedRateLimit.resetAt,
      remaining: updatedRateLimit.remaining,
      analysisMetadata: {
        extractedTextLength: extractedText.length,
        originalFileName: profile.originalName,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("LinkedIn optimization error:", error);

    // Enhanced error handling
    if (error.message && error.message.includes("PDF")) {
      return res.status(400).json({
        error: "PDF processing failed",
        message:
          "Could not process the PDF file. Please ensure it's a valid, text-based PDF.",
      });
    }

    if (error.message && error.message.includes("download")) {
      return res.status(500).json({
        error: "File access failed",
        message:
          "Could not access the uploaded file. Please try uploading again.",
      });
    }

    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        error: "OpenAI rate limit reached",
        message:
          "Too many requests to AI service. Please try again in a few minutes.",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid file reference" });
    }

    if (error.message && error.message.includes("Unknown service")) {
      return res.status(500).json({
        error: "Service configuration error",
        message: "Please contact support.",
      });
    }

    res.status(500).json({
      error: "Optimization failed",
      message:
        "An unexpected error occurred. Please try again later or contact support.",
    });
  }
});

// Rate limit status endpoint
router.get("/rate-limit-status", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const rateLimitResult = rateLimitService.checkLimit(userId, "linkedin");

    res.json({
      remaining: rateLimitResult.remaining,
      resetAt: rateLimitResult.resetAt,
      limited: rateLimitResult.limited,
      service: "linkedin",
    });
  } catch (error) {
    console.error("Rate limit status error:", error);
    res.status(500).json({ error: "Failed to get rate limit status" });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 10MB." });
    }
  }

  if (error.message === "Only PDF files are allowed") {
    return res.status(400).json({ error: error.message });
  }

  console.error("Multer error:", error);
  res.status(500).json({ error: "Upload failed" });
});

module.exports = router;
