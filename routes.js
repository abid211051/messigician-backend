import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import onboardRoutes from "./modules/onboard/onboard.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/onboard", onboardRoutes);

export default router;
