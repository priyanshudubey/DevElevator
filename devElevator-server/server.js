require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();

const isDev = process.env.NODE_ENV !== "production";

// CORS for frontend origin
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
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

// === Routes ===
const authRoutes = require("./routes/auth.js");
const githubRoutes = require("./routes/github");
const resumeRoutes = require("./routes/resume");
const readmeRoutes = require("./routes/readme");

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/readme", readmeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
