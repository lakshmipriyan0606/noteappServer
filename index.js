import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import cors from "cors";
import passport from "passport";
import authRouter from "./routes/authRoutes.js";
import noteAppRouter from "./routes/CRUDNoteAppRoutes.js";
import authGoogleGithubRoutes from "./routes/authGoogleGithubRoutes.js";
import session from "express-session";
import passportGithub from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

connectDB();

const app = express();

// Middleware
app.use(express.json());

app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_SECRET = process.env.GITHUB_APP_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || "http://localhost:4000";
console.log('BASE_URL: ', BASE_URL);

const GitHubStrategy = passportGithub.Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_APP_ID,
      clientSecret: GITHUB_APP_SECRET,
      callbackURL: `${BASE_URL}/auth/github/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/auth/google/callback`
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Google Strategy Initialized");
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use("/api", authRouter);
app.use("/api", noteAppRouter);
app.use(authGoogleGithubRoutes);

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out");
    }
    res.send("Logged out");
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to NoteApp Server!");
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
