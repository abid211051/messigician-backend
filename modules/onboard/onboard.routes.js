import { Router } from "express";
import {
  messCreationCtrl,
  messJoinRequestCtrl,
  getSubMessListCtrl,
} from "./onboard.controller.js";
import { verifyJwtToken } from "../../utils/jwtToken.js";
import { uploadSingle } from "../../config/multer.js";
import { validate } from "../../utils/zodValidate.js";
import {
  createMessSchema,
  messJoinReqSchema,
  subMessListSchema,
} from "./onboard.validation.js";

const router = Router();

router.post(
  "/create-mess",
  verifyJwtToken,
  uploadSingle,
  validate(createMessSchema),
  messCreationCtrl,
);
router.get(
  "/sub-mess-list/:mess_id",
  verifyJwtToken,
  validate(subMessListSchema),
  getSubMessListCtrl,
);
router.post(
  "/join-request",
  verifyJwtToken,
  validate(messJoinReqSchema),
  messJoinRequestCtrl,
);
export default router;
