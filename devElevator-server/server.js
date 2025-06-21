require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./db");
const userAuthMiddleware = require("./middleware/auth");

const app = express();

const isDev = process.env.NODE_ENV !== "production";

// CORS for frontend origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

connectDB();

// === Middlewares ===
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Session setup (to persist login between refreshes)
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
      secure: false, // ❌ true only for production HTTPS
      sameSite: isDev ? "lax" : "none", // ✅ Use "lax" for localhost
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

const authRoutes = require("./routes/auth.js");
app.use("/api/auth", authRoutes);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
