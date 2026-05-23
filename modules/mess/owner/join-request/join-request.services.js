import pool from "../../../../config/db.js";
import AppError from "../../../../utils/appError.js";

import {
  fetchJoinRequestsByMessIdRepo,
  getUserByIdForUpdateRepo,
  insertUserIntoSubMessRepo,
  removeJoinRequestRepo,
} from "./join-request.repository.js";

export const addUserToSubmessService = async ({
  request_id,
  user_id,
  sub_mess_id,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const user = await getUserByIdForUpdateRepo(client, user_id);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.mess_id) {
      await removeJoinRequestRepo(client, request_id);
      await client.query("COMMIT");
      return { status: "already_in_mess" };
    }

    const { rows, rowCount } = await insertUserIntoSubMessRepo(
      client,
      user_id,
      sub_mess_id,
    );

    if (rowCount === 0) {
      throw new AppError(409, "User is already assigned to a sub-mess");
    }

    await removeJoinRequestRepo(client, request_id);
    await client.query("COMMIT");

    return { status: "accepted", data: rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const rejectJoinRequestService = async ({ request_id }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rowCount } = await removeJoinRequestRepo(client, request_id);

    if (rowCount === 0) {
      throw new AppError(404, "Join request not found");
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getJoinRequestsService = async ({ mess_id }) => {
  return fetchJoinRequestsByMessIdRepo(mess_id);
};
