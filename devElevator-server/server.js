require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./db");
const userAuthMiddleware = require("./middleware/auth");
const linkedinRoutes = require("./routes/linkedin");

const app = express();

const isDev = process.env.NODE_ENV !== "production";

// CORS for frontend origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Connect to MongoDB
connectDB();

// === Middlewares ===
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Session setup
app.use(
  session({
    name: "develevator.sid",
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: isDev ? "lax" : "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

const authRoutes = require("./routes/auth.js");
app.use("/api/auth", authRoutes);

// Remove local uploads static serving since we're using FTP
// app.use("/uploads", express.static("uploads"));

app.use("/api/linkedin", linkedinRoutes);
app.use(userAuthMiddleware);

// === Routes ===
const githubRoutes = require("./routes/github");
const resumeRoutes = require("./routes/resume");
const readmeRoutes = require("./routes/readme");
const structureRoutes = require("./routes/structure");

app.use("/api/github", githubRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/readme", readmeRoutes);
app.use("/api/structure", structureRoutes);

// Start server (MongoDB only)
const startServer = async () => {
  try {
    // Test FTP connection
    const ftpService = require("./services/ftpService");
    await ftpService.connect();
    console.log("✅ FTP connection test successful");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error("Please check your FTP and MongoDB configuration.");
    process.exit(1);
  }
};

startServer();
