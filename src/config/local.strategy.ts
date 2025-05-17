import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import UserModel from "../models/user.model";



passport.use(new LocalStrategy(
  { usernameField: "email" }, // use email instead of username
  async (email, password, done) => {
    try {
      // Find user by email and include password field explicitly
      const user = await UserModel.findOne({ email }).select("+password");
      if (!user) {
        return done(null, false, { message: "Incorrect email or password" });
      }

      // Compare password using your model method
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect email or password" });
      }

      // Omit password before returning user object
      const safeUser = user.omitPassword();

      return done(null, safeUser);
    } catch (err) {
      return done(err);
    }
  }
));
