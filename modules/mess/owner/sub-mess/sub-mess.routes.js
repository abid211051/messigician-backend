import { Router } from "express";
import { verifyJwtToken } from "../../../../utils/jwtToken.js";
import { isVerifiedRole } from "../../../../utils/roles.js";
import { validate } from "../../../../utils/zodValidate.js";

import {
  getAllSubMessCtrl,
  createSubMessCtrl,
  deleteSingleSubMessCtrl,
  deleteBulkSubMessCtrl,
} from "./sub-mess.controller.js";
import {
  createSubMessSchema,
  deleteBulkSubMessSchema,
  deleteSingleSubMessSchema,
  getAllSubMessWithInfoSchema,
} from "./sub-mess.validation.js";

const router = Router();

router.get(
  "/all/:mess_id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(getAllSubMessWithInfoSchema),
  getAllSubMessCtrl,
);

router.post(
  "/:mess_id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(createSubMessSchema),
  createSubMessCtrl,
);

router.delete(
  "/single/:id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(deleteSingleSubMessSchema),
  deleteSingleSubMessCtrl,
);

router.delete(
  "/bulk",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(deleteBulkSubMessSchema),
  deleteBulkSubMessCtrl,
);

export default router;
