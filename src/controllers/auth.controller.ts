import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("User after Google login:", req.user);
    const currentWorkspace = req.user?.currentWorkspace;
    console.log("Current Workspace:", currentWorkspace);

    if (!currentWorkspace) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    };

    const currentWorkspaceId = typeof currentWorkspace === 'string' ? currentWorkspace : currentWorkspace?._id;

    return res.redirect(
      `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspaceId}`
    );
  }
);


export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message?: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.status(401).json({
            message: info?.message || "Invalid email or password",
          });
        }

        req.logIn(user, (err: Error | null) => {
          if (err) {
            return next(err);
          }

          return res.status(200).json({
            message: "Logged in successfully",
            user,
          });
        });
      }  
    )(req, res, next);
  }
);


export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res
          .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
          .json({ error: "Failed to log out" });
      }
      // Destroy the session after logout
      req.session.destroy((err) => {
        if (err) {
          return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({ error: "Failed to destroy session" });
        }
        res.clearCookie("connect.sid"); // Optional
        return res.status(HTTPSTATUS.OK).json({ message: "Logged out successfully" });
      });
    });
  }
);
