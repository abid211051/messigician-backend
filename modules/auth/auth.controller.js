import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { createJwtToken } from "../../utils/jwtToken.js";
import { cookieOptions } from "../../utils/cookieOptions.js";
import { getOrCreateUserServe } from "./auth.services.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_URI + "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, cb) => {
      const fname = profile.displayName;
      const email = profile.emails?.[0]?.value;
      const avatar_url = profile.photos?.[0]?.value;
      try {
        const user = await getOrCreateUserServe({ fname, email, avatar_url });
        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    },
  ),
);

const googleAuthInitCtrl = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleAuthCallbackCtrl = passport.authenticate("google", {
  failureRedirect: process.env.FRONTEND_URI,
  session: false,
});

const googleSucessfulAuthCtrl = (req, res) => {
  const accessToken = createJwtToken("2d", req.user);
  const refreshToken = createJwtToken("7d", req.user);

  res.cookie(
    "accessToken",
    accessToken,
    cookieOptions(2 * 24 * 60 * 60 * 1000),
  );
  res.cookie(
    "refreshToken",
    refreshToken,
    cookieOptions(7 * 24 * 60 * 60 * 1000),
  );

  const redirect_path =
    req.user?.role === "admin" ? "/admin/profile" : "/user/profile";
  res.redirect(process.env.FRONTEND_URI + redirect_path);
};

export { googleAuthInitCtrl, googleAuthCallbackCtrl, googleSucessfulAuthCtrl };
