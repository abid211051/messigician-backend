import pool from "../../../../config/db.js";
import {
  getAllSubMessByMessIdQuery,
  getAllSubMessMembersCntQuery,
  getAllSubMessMembersQuery,
} from "./tenants.query.js";

export async function getAllSubMessByMessIdRepo({ mess_id }) {
  const { rows } = await pool.query(getAllSubMessByMessIdQuery, [mess_id]);
  return rows;
}

export async function getAllSubMessMembersCntRepo({ sub_mess_ids, mess_id }) {
  const { rows } = await pool.query(getAllSubMessMembersCntQuery, [
    sub_mess_ids,
    mess_id,
  ]);

  return rows[0].count;
}

export async function getAllSubMessMembersRepo({
  mess_id,
  sub_mess_ids,
  limit,
  offset,
}) {
  const { rows } = await pool.query(getAllSubMessMembersQuery, [
    sub_mess_ids,
    mess_id,
    limit,
    offset,
  ]);
  return rows;
}
