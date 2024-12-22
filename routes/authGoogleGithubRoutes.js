import jwt from "jsonwebtoken";
import passport from "passport";
import express from "express";
import User from "../model/user.js";

const authGoogleGithubRoutes = express.Router();

const getFrontendUrl = () =>
  process.env.BASE_URL || "http://localhost:5713";

authGoogleGithubRoutes.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authGoogleGithubRoutes.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const googleUser = req.user;

      if (!googleUser) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Google user not found" });
      }

      const { id, displayName, emails } = googleUser;
      const email = emails?.[0]?.value;

      if (!email) {
        return res
          .status(400)
          .json({ error: "Email not available from Google" });
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          name: displayName || "Google User",
          email,
          unquieId: id,
          authProvider: "google",
        });
        await user.save();
      }

      const payloadToken = { id: user.unquieId, email: user.email };
      const token = jwt.sign(payloadToken, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const frontendUrl = getFrontendUrl();
      console.log('frontendUrl: ', frontendUrl);
      res.redirect(
        `${frontendUrl}/auth/success?token=${token}&name=${user.name}`
      );
    } catch (err) {
      console.error("Error during Google authentication callback:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

authGoogleGithubRoutes.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

authGoogleGithubRoutes.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      const githubUser = req.user;

      if (!githubUser) {
        return res
          .status(401)
          .json({ error: "Unauthorized: GitHub user not found" });
      }

      const { id, displayName, emails } = githubUser;
      const email = emails?.[0]?.value || `${id}@github.com`

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          name: displayName || "GitHub User",
          email,
          unquieId: id,
          authProvider: "github",
        });
        await user.save();
      }

      const payloadToken = { id: user.unquieId, email: user.email };
      const token = jwt.sign(payloadToken, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const frontendUrl = getFrontendUrl();
      res.redirect(
        `${frontendUrl}/auth/success?token=${token}&name=${user.name}`
      );
    } catch (err) {
      console.error("Error during GitHub authentication callback:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default authGoogleGithubRoutes;
