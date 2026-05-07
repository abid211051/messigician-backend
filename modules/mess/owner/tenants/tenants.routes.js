import { Router } from "express";
import { verifyJwtToken } from "../../../../utils/jwtToken.js";
import { isVerifiedRole } from "../../../../utils/roles.js";
import { validate } from "../../../../utils/zodValidate.js";
import {
  allSubMessMembersSchema,
  allSubMessSchema,
} from "./tenants.validation.js";
import {
  getAllSubMessCtrl,
  getAllSubMessMembersCtrl,
} from "./tenants.controller.js";

const router = Router();

router.get(
  "/sub-mess/all/:mess_id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(allSubMessSchema),
  getAllSubMessCtrl,
);

router.get(
  "/:mess_id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(allSubMessMembersSchema),
  getAllSubMessMembersCtrl,
);

export default router;
