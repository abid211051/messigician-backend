import { Router } from "express";
import {
  getJoinRequestsCtrl,
  joinRequestAcceptCtrl,
  joinRequestRejectCtrl,
} from "./join-request.controller.js";
import { verifyJwtToken } from "../../../../utils/jwtToken.js";
import { validate } from "../../../../utils/zodValidate.js";
import {
  getJoinRequestsSchema,
  joinRequestAcceptSchema,
  joinRequestRejectSchema,
} from "./join-request.validation.js";
import { isVerifiedRole } from "../../../../utils/roles.js";

const router = Router();

router.post(
  "/accept",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(joinRequestAcceptSchema),
  joinRequestAcceptCtrl,
);
router.delete(
  "/reject/:request_id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(joinRequestRejectSchema),
  joinRequestRejectCtrl,
);
router.get(
  "/:mess_id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(getJoinRequestsSchema),
  getJoinRequestsCtrl,
);

export default router;
