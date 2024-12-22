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

app.use(cors());

app.use(express.json());

app.use(
  session({
    secret: "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// app.use(
//   cors({
//     origin: "http://your-frontend-url.com",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// Routes

const GITHUB_APP_SECRET = process.env.GITHUB_APP_SECRET;
const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GitHubStrategy = passportGithub.Strategy;

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_APP_ID,
      clientSecret: GITHUB_APP_SECRET,
      callbackURL: "/auth/github/callback",
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
      callbackURL: "/auth/google/callback",
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

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message });
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

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
