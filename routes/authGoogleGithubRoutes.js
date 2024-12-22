import jwt from "jsonwebtoken";
import passport from "passport";
import express from "express";
import User from "../model/user.js";
import { v4 as uuidv4 } from "uuid";

const authGoogleGithubRoutes = express.Router();

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
      // console.log("googleUser: ", googleUser);
      if (!googleUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, displayName, emails } = googleUser;

      const email = emails?.[0]?.value;

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          name: displayName,
          email,
          unquieId: id,
          authProvider: "google",
        });
        await user.save();
      }

      const payloadToken = {
        id,
        email: email,
      };

      const token = jwt.sign(payloadToken, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.redirect(
        `http://localhost:5173/auth/success?token=${token}&name=${displayName}`
      );
    } catch (err) {
      console.error("Error during Google authentication callback:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// GitHub Authentication
authGoogleGithubRoutes.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

authGoogleGithubRoutes.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!user) {
        user = new User({
          name: user.displayName,
          email: user.id,
          unquieId: user.id,
          authProvider: "github",
        });
      }

      const payloadToken = {
        id: user?.id,
        email: user?.id,
      };

      const token = jwt.sign(payloadToken, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.redirect(
        `http://localhost:5173/auth/success?token=${token}&name=${user.displayName}`
      );
    } catch (err) {
      console.error("Error during GitHub authentication callback:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default authGoogleGithubRoutes;
