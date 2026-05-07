import { PER_PAGE_ITEMS } from "../../../../utils/constants.js";
import {
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
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    let parsedSubMessIds = [];
    if (typeof sub_mess_ids === "string" && sub_mess_ids.trim().length > 0) {
      parsedSubMessIds = sub_mess_ids
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    const totalSubMessMembers = parseInt(
      await getAllSubMessMembersCntRepo({
        mess_id,
        sub_mess_ids: parsedSubMessIds,
      }),
      10,
    );

    if (!totalSubMessMembers || totalSubMessMembers < 1) {
      return {
        data: [],
        meta: {
          totalItems: totalSubMessMembers,
          totalPages: 0,
          currentPage: 0,
          itemsPerPage: PER_PAGE_ITEMS,
        },
      };
    }

    const totalPages = Math.ceil(totalSubMessMembers / PER_PAGE_ITEMS);

    const validPage = Math.min(parsedPage, totalPages);

    const offset = (validPage - 1) * PER_PAGE_ITEMS;

    const members = await getAllSubMessMembersRepo({
      mess_id,
      sub_mess_ids: parsedSubMessIds,
      limit: PER_PAGE_ITEMS,
      offset,
    });

    return {
      data: members,
      meta: {
        totalItems: totalSubMessMembers,
        totalPages,
        currentPage: validPage,
        itemsPerPage: PER_PAGE_ITEMS,
      },
    };
  } catch (error) {
    throw error;
  }
}
