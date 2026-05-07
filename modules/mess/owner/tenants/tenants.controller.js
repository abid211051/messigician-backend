import {
  getAllSubMessService,
  getAllSubMessMembersService,
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
