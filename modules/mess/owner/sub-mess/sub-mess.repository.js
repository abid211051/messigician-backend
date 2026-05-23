import pool from "../../../../config/db.js";
import {
  cntAllSubMessInfoQuery,
  getAllSubMessInfoDataQuery,
} from "./sub-mess.query.js";

const searchQueryFun = (search) => (search ? `%${search}%` : null);

export async function cntAllSubMessInfoRepo({ mess_id, search }) {
  const { rows } = await pool.query(cntAllSubMessInfoQuery, [
    mess_id,
    searchQueryFun(search),
  ]);
  return rows[0].count;
}

export async function getAllSubMessInfoDataRepo({
  mess_id,
  search,
  sortBy,
  sortOrder,
  limit,
  offset,
}) {
  const { rows } = await pool.query(getAllSubMessInfoDataQuery, [
    mess_id,
    searchQueryFun(search),
    sortBy,
    sortOrder,
    limit,
    offset,
  ]);
  return rows;
}
