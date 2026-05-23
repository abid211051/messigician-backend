import pool from "../../../../config/db.js";
import {
  deleteBulkSubMessMembersQuery,
  deleteSingleSubMessMemberQuery,
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

export async function deleteSingleSubMessMemberRepo({ id }) {
  const { rowCount } = await pool.query(deleteSingleSubMessMemberQuery, [id]);
  return rowCount;
}

export async function deleteBulkSubMessMembersRepo({ ids }) {
  const { rowCount } = await pool.query(deleteBulkSubMessMembersQuery, [ids]);
  return rowCount;
}

export async function editSubMessMemberRepo({
  id,
  sub_mess_id,
  monthly_rent,
  total_due,
}) {
  const fields = [];
  const values = [];

  if (sub_mess_id !== undefined) {
    values.push(sub_mess_id);
    fields.push(`sub_mess_id=$${values.length}`);
  }

  if (monthly_rent !== undefined) {
    values.push(monthly_rent);
    fields.push(`monthly_rent=$${values.length}`);
  }

  if (total_due !== undefined) {
    values.push(total_due);
    fields.push(`total_due=$${values.length}`);
  }

  const updateQuery = `
    UPDATE sub_mess_members
    SET ${fields.join(", ")}
    WHERE id=$${values.length + 1}
  `;

  const { rowCount } = await pool.query(updateQuery, [...values, id]);
  return rowCount;
}
