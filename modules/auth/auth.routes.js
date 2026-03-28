import { Router } from "express";
import {
  googleAuthInitCtrl,
  googleAuthCallbackCtrl,
  googleSucessfulAuthCtrl,
} from "./auth.controller.js";
import { refreshAccessToken } from "../../utils/jwtToken.js";

const router = Router();

router.get("/google", googleAuthInitCtrl);
router.get("/google/redirect", googleAuthCallbackCtrl, googleSucessfulAuthCtrl);
router.post("/refresh", refreshAccessToken);

export default router;
