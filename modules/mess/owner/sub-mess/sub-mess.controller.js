import { getAllSubMessService } from "./sub-mess.services.js";

export async function getAllSubMessCtrl(req, res, next) {
  try {
    const { mess_id } = req.params;
    const { page, limit, search, sortBy, sortOrder } = req.query;

    const result = await getAllSubMessService({
      mess_id,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
