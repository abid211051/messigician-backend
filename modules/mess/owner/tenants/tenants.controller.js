import {
  getAllSubMessService,
  getAllSubMessMembersService,
  deleteSingleSubMessMemberService,
  deleteBulkSubMessMembersService,
  editSubMessMemberService,
} from "./tenants.services.js";

export async function getAllSubMessCtrl(req, res, next) {
  try {
    const { mess_id } = req.params;

    const results = await getAllSubMessService({ mess_id });
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllSubMessMembersCtrl(req, res, next) {
  try {
    const { mess_id } = req.params;
    const { page, sub_mess_ids } = req.query;
    const results = await getAllSubMessMembersService({
      mess_id,
      page,
      sub_mess_ids,
    });
    res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSingleSubMessMemberCtrl(req, res, next) {
  try {
    const { id } = req.params;
    await deleteSingleSubMessMemberService({ id });
    res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBulkSubMessMembersCtrl(req, res, next) {
  try {
    const { ids } = req.body;
    await deleteBulkSubMessMembersService({ ids });
    res.status(200).json({
      success: true,
      message: "Members deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function editSubMessMemberCtrl(req, res, next) {
  try {
    const { id } = req.params;
    const { sub_mess_id, monthly_rent, total_due } = req.body;

    await editSubMessMemberService({
      id,
      sub_mess_id,
      monthly_rent,
      total_due,
    });
    res.status(200).json({
      success: true,
      message: "Members Edited successfully",
    });
  } catch (error) {
    next(error);
  }
}
