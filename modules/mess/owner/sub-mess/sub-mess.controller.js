import {
  createSubMessService,
  deleteSingleSubMessService,
  deleteBulkSubMessService,
  getAllSubMessService,
  getSingleSubMessService,
} from "./sub-mess.services.js";

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

export async function getSingleSubMessCtrl(req, res, next) {
  try {
    const { id } = req.params;
    const data = await getSingleSubMessService({ id });
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSubMessCtrl(req, res, next) {
  try {
    const { mess_id } = req.params;
    const { fname, total_rent, no_of_seats } = req.body;
    await createSubMessService({ mess_id, fname, total_rent, no_of_seats });
    res.status(201).json({
      success: true,
      message: "Sub mess created successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSingleSubMessCtrl(req, res, next) {
  try {
    const { id } = req.params;
    await deleteSingleSubMessService({ id });
    res.status(200).json({
      success: true,
      message: "SubMess is Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBulkSubMessCtrl(req, res, next) {
  try {
    const { ids } = req.body;
    await deleteBulkSubMessService({ ids });
    res.status(200).json({
      success: true,
      message: "SubMess are Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
}
