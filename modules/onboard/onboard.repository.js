import pool from "../../config/db.js";
import {
  checkUserIsInMessQuery,
  getSubMessListQuery,
  messCreationCTEQuery,
  messJoinReqQuery,
} from "./onboard.query.js";

export async function checkUserIsInMessRepo({ user_id }) {
  const { rowCount } = await pool.query(checkUserIsInMessQuery, [user_id]);
  return rowCount;
}

export async function createMessRepo({
  fname,
  images,
  sub_mess_name,
  user_id,
}) {
  const { rows } = await pool.query(messCreationCTEQuery, [
    fname,
    images,
    sub_mess_name,
    user_id,
  ]);
  return rows[0];
}

export async function messJoinReqRepo({ user_id, mess_id, sub_mess_id }) {
  const { rows, rowCount } = await pool.query(messJoinReqQuery, [
    user_id,
    mess_id,
    sub_mess_id,
  ]);
  return { rows, rowCount };
}

export async function getSubMessListRepo({ mess_id }) {
  const { rows } = await pool.query(getSubMessListQuery, [mess_id]);
  return rows;
}
