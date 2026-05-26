import AppError from "../../../../utils/appError.js";
import { PER_PAGE_ITEMS } from "../../../../utils/constants.js";
import {
  cntAllSubMessInfoRepo,
  createSubMessRepo,
  deleteSingleSubMessRepo,
  deleteBulkSubMessRepo,
  getAllSubMessInfoDataRepo,
} from "./sub-mess.repository.js";

export async function getAllSubMessService({
  mess_id,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
}) {
  const totalItems = Number(
    await cntAllSubMessInfoRepo({
      mess_id,
      search,
    }),
  );
  if (!totalItems || totalItems < 1) {
    return {
      data: [],
      meta: {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: limit,
        search,
        sortBy,
        sortOrder,
      },
    };
  }

  const totalPages = Math.ceil(totalItems / limit);
  const validPage = Math.min(page, totalPages);
  const offset = (validPage - 1) * limit;

  const data = await getAllSubMessInfoDataRepo({
    mess_id,
    search,
    sortBy,
    sortOrder,
    limit,
    offset,
  });

  return {
    data,
    meta: {
      totalItems,
      totalPages,
      currentPage: validPage,
      itemsPerPage: limit,
      search,
      sortBy,
      sortOrder,
    },
  };
}

export async function createSubMessService({
  mess_id,
  fname,
  total_rent,
  no_of_seats,
}) {
  await createSubMessRepo({ mess_id, fname, total_rent, no_of_seats });
  return true;
}

export async function deleteSingleSubMessService({ id }) {
  const rowCnt = await deleteSingleSubMessRepo({ id });
  if (rowCnt === 0) {
    throw new AppError(404, "Sub-Mess is not found or already deleted");
  }
  return true;
}

export async function deleteBulkSubMessService({ ids }) {
  const rowCnt = await deleteBulkSubMessRepo({ ids });
  if (rowCnt === 0) {
    throw new AppError(404, "Sub-Mess are not found or already deleted");
  }
  return true;
}
