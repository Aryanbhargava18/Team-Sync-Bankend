import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import { googleLoginCallback, logOutController, loginController } from "../controllers/auth.controller";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

authRoutes.get(
  "/google/oauth/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`,
  }),
  googleLoginCallback
);


// 🚨 Add this line for email/password login:
authRoutes.post("/login", loginController);

authRoutes.post("/logout", logOutController);

export default authRoutes;
