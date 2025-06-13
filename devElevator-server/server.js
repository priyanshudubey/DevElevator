require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // should be http://localhost:5173
    credentials: true,
  })
);

app.use(cookieParser());

const authRoutes = require("./routes/auth.js");
const githubRoutes = require("./routes/github");
const resumeRoutes = require("./routes/resume");

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/resume", resumeRoutes);

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
