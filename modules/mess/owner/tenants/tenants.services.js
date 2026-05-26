import AppError from "../../../../utils/appError.js";
import { PER_PAGE_ITEMS } from "../../../../utils/constants.js";
import {
  deleteBulkSubMessMembersRepo,
  deleteSingleSubMessMemberRepo,
  editSubMessMemberRepo,
  getAllSubMessByMessIdRepo,
  getAllSubMessMembersCntRepo,
  getAllSubMessMembersRepo,
} from "./tenants.repository.js";

export async function getAllSubMessService({ mess_id }) {
  try {
    const fetchedSubMess = await getAllSubMessByMessIdRepo({ mess_id });
    return fetchedSubMess;
  } catch (error) {
    throw error;
  }
}

export async function getAllSubMessMembersService({
  mess_id,
  page,
  sub_mess_ids,
}) {
  try {
    const totalItems = Number(
      await getAllSubMessMembersCntRepo({
        mess_id,
        sub_mess_ids,
      }),
    );

    if (!totalItems || totalItems < 1) {
      return {
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: PER_PAGE_ITEMS,
        },
      };
    }

    // Pagination logic
    const totalPages = Math.ceil(totalItems / PER_PAGE_ITEMS);
    const validPage = Math.min(page, totalPages);
    const offset = (validPage - 1) * PER_PAGE_ITEMS;

    const members = await getAllSubMessMembersRepo({
      mess_id,
      sub_mess_ids,
      limit: PER_PAGE_ITEMS,
      offset,
    });

    return {
      data: members,
      meta: {
        totalItems,
        totalPages,
        currentPage: validPage,
        itemsPerPage: PER_PAGE_ITEMS,
      },
    };
  } catch (error) {
    throw error;
  }
}

export async function deleteSingleSubMessMemberService({ id }) {
  const rowCnt = await deleteSingleSubMessMemberRepo({ id });
  if (rowCnt === 0) {
    throw new AppError(404, "Member is not found or already deleted");
  }
  return true;
}

export async function deleteBulkSubMessMembersService({ ids }) {
  const rowCnt = await deleteBulkSubMessMembersRepo({ ids });
  if (rowCnt === 0) {
    throw new AppError(404, "Members are not found or already deleted");
  }
  return true;
}

export async function editSubMessMemberService({
  id,
  sub_mess_id,
  monthly_rent,
  total_due,
}) {
  const rowCnt = await editSubMessMemberRepo({
    id,
    sub_mess_id,
    monthly_rent,
    total_due,
  });
  if (rowCnt === 0) {
    throw new AppError(404, "Member not found or no changes made");
  }
  return true;
}
