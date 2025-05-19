import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";

import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";

const app = express();

app.use(cookieParser());
app.set('trust proxy', 1);
app.use(
  cors({
    origin: "https://teamsyncc.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production", // true only in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);



app.use(passport.initialize());
app.use(passport.session());

// Debug middleware - remove in production
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session Data:", req.session);
  console.log("Authenticated:", req.isAuthenticated());
  console.log("User:", req.user);
  next();
});

const BASE_PATH = config.BASE_PATH;

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException(
      "This is a bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
