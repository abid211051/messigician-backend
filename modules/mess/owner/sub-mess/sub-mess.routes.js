import { Router } from "express";
import { verifyJwtToken } from "../../../../utils/jwtToken.js";
import { isVerifiedRole } from "../../../../utils/roles.js";
import { validate } from "../../../../utils/zodValidate.js";

import { getAllSubMessCtrl } from "./sub-mess.controller.js";
import { getAllSubMessWithInfoSchema } from "./sub-mess.validation.js";

const router = Router();

router.get(
  "/all/:mess_id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(getAllSubMessWithInfoSchema),
  getAllSubMessCtrl,
);

export default router;
