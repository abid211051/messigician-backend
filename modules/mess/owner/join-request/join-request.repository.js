import pool from "../../../../config/db.js";
import {
  addUserIntoSubMess,
  deleteFromJoinRequestTable,
  getJoinRequestsByMessId,
  getUserForUpdate,
} from "./join-request.query.js";

export const getUserByIdForUpdateRepo = async (client, user_id) => {
  const { rows } = await client.query(getUserForUpdate, [user_id]);
  return rows[0] ?? null;
};

export const insertUserIntoSubMessRepo = async (
  client,
  user_id,
  sub_mess_id,
) => {
  return client.query(addUserIntoSubMess, [user_id, sub_mess_id]);
};

export const removeJoinRequestRepo = async (client, request_id) => {
  return client.query(deleteFromJoinRequestTable, [request_id]);
};

export const fetchJoinRequestsByMessIdRepo = async (mess_id) => {
  const { rows } = await pool.query(getJoinRequestsByMessId, [mess_id]);
  return rows;
};
