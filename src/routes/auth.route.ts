import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import { googleLoginCallback, logOutController, loginController } from "../controllers/auth.controller";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();
import { registerUserController } from "../controllers/auth.controller";

// Temporarily disabled email/password registration route
// Uncomment this line to enable email/password registration again
// authRoutes.post("/register", registerUserController);
authRoutes.post("/register", (req, res) => {
  res.status(403).json({ message: "Email/password registration is temporarily disabled. Please use Google signup." });
});

// Google OAuth login route
authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback route
authRoutes.get(
  "/google/oauth/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl,
  }),
  (req, res) => {
    if (!req.user || !req.user.currentWorkspace) {
      return res.redirect(failedUrl);
    }

    const workspaceId =
      typeof req.user.currentWorkspace === "string"
        ? req.user.currentWorkspace
        : req.user.currentWorkspace._id;

    res.redirect(`${config.FRONTEND_ORIGIN}/workspace/${workspaceId}`);
  }
);

import { Request, Response } from "express";

authRoutes.get("/test", (req: Request, res: Response) => {
  res.json({ ok: true });
});

// Temporarily disabled email/password login route
// Uncomment this line to enable email/password login again
// authRoutes.post("/login", loginController);
authRoutes.post("/login", (req, res) => {
  res.status(403).json({ message: "Email/password login is temporarily disabled. Please use Google login." });
});

authRoutes.post("/logout", logOutController);

export default authRoutes;
