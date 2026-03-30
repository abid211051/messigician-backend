import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { setAccessToken, setRefreshToken } from "../../utils/jwtToken.js";
import { getOrCreateUserServe, setRedirectPathServe } from "./auth.services.js";

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
  setAccessToken({
    payload: req.user,
    res,
  });
  setRefreshToken({
    payload: req.user,
    res,
  });
  const redirect_path = setRedirectPathServe({
    role: req.user.role,
    mess_role: req.user.mess_role,
  });
  return res.redirect(process.env.FRONTEND_URI + redirect_path);
};

export { googleAuthInitCtrl, googleAuthCallbackCtrl, googleSucessfulAuthCtrl };
