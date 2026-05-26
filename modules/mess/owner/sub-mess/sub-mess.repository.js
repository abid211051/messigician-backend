import pool from "../../../../config/db.js";
import {
  cntAllSubMessInfoQuery,
  createSubMessInfoQuery,
  createSubMessQuery,
  deleteSingleSubMessQuery,
  deleteBulkSubMessQuery,
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

export async function createSubMessRepo({
  mess_id,
  fname,
  total_rent,
  no_of_seats,
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(createSubMessQuery, [mess_id, fname]);

    const sub_mess_id = rows[0].id;

    const fields = [];
    const values = [];
    const placeholders = [];

    values.push(sub_mess_id);
    fields.push("sub_mess_id");
    placeholders.push(`$${values.length}`);

    if (total_rent != undefined) {
      values.push(total_rent);
      fields.push("total_rent");
      placeholders.push(`$${values.length}`);
    }

    if (no_of_seats != undefined) {
      values.push(no_of_seats);
      fields.push("no_of_seats");
      placeholders.push(`$${values.length}`);
    }

    await client.query(
      createSubMessInfoQuery({ values, fields, placeholders }),
      values,
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteSingleSubMessRepo({ id }) {
  const { rowCount } = await pool.query(deleteSingleSubMessQuery, [id]);
  return rowCount;
}

export async function deleteBulkSubMessRepo({ ids }) {
  const { rowCount } = await pool.query(deleteBulkSubMessQuery, [ids]);
  return rowCount;
}
