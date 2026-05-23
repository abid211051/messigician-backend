import { Router } from "express";
import { verifyJwtToken } from "../../../../utils/jwtToken.js";
import { isVerifiedRole } from "../../../../utils/roles.js";
import { validate } from "../../../../utils/zodValidate.js";
import {
  allSubMessMembersSchema,
  allSubMessSchema,
  deleteBulkSubMessMembersSchema,
  deleteSingleSubMessMemberSchema,
  editSubMessMemberSchema,
} from "./tenants.validation.js";
import {
  getAllSubMessCtrl,
  getAllSubMessMembersCtrl,
  deleteSingleSubMessMemberCtrl,
  deleteBulkSubMessMembersCtrl,
  editSubMessMemberCtrl,
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

router.delete(
  "/single/:id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(deleteSingleSubMessMemberSchema),
  deleteSingleSubMessMemberCtrl,
);

router.delete(
  "/bulk",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(deleteBulkSubMessMembersSchema),
  deleteBulkSubMessMembersCtrl,
);

router.put(
  "/edit/:id",
  verifyJwtToken,
  isVerifiedRole("owner"),
  validate(editSubMessMemberSchema),
  editSubMessMemberCtrl,
);

export default router;
