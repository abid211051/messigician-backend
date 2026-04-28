import pool from "../../../../config/db.js";
import AppError from "../../../../utils/appError.js";
import {
  addUserIntoSubMess,
  deleteFromJoinRequestTable,
  getJoinRequestsByMessId,
} from "./join-request.query.js";

export const addUserToSubmessService = async ({
  request_id,
  user_id,
  sub_mess_id,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows, rowCount } = await client.query(addUserIntoSubMess, [
      user_id,
      sub_mess_id,
    ]);

    if (rowCount === 0) {
      throw new AppError(409, "User is already in a mess");
    }

    await client.query(deleteFromJoinRequestTable, [request_id]);
    await client.query("COMMIT");

    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const rejectJoinRequestService = async ({ request_id }) => {
  const { rowCount } = await pool.query(deleteFromJoinRequestTable, [
    request_id,
  ]);

  if (rowCount === 0) {
    throw new AppError(404, "Join request not found");
  }
};

export const getJoinRequestsService = async ({ mess_id }) => {
  const { rows } = await pool.query(getJoinRequestsByMessId, [mess_id]);
  if (rows.length === 0) {
    return [];
  }
  return rows;
};
