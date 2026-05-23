import { PER_PAGE_ITEMS } from "../../../../utils/constants.js";
import {
  cntAllSubMessInfoRepo,
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
