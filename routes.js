import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import onboardRoutes from "./modules/onboard/onboard.routes.js";
import joinRequestRoutes from "./modules/mess/owner/join-request/join-request.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/onboard", onboardRoutes);
router.use("/join-request", joinRequestRoutes);

export default router;
