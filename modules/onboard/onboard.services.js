import { uploadToCloudinary } from "../../config/cloudinary.js";
import {
  checkUserIsInMessQuery,
  messCreationCTEQuery,
  messJoinReqQuery,
} from "./onboard.query.js";
import pool from "../../config/db.js";
import AppError from "../../utils/appError.js";

const createMessService = async ({ file, fname, user_id }) => {
  const { rowCount } = await pool.query(checkUserIsInMessQuery, [user_id]);
  if (rowCount > 0) {
    throw new AppError(409, "User already in a mess");
  }
  let images = [];
  if (file) {
    const result = await uploadToCloudinary(file.buffer);
    images = [{ url: result.secure_url, public_id: result.public_id }];
  }
  const { rows } = await pool.query(messCreationCTEQuery, [
    fname,
    JSON.stringify(images),
    "Block-1",
    user_id,
  ]);

  return rows[0];
};

const messJoinRequestService = async ({ user_id, mess_id, sub_mess_id }) => {
  const { rows, rowCount } = await pool.query(messJoinReqQuery, [
    user_id,
    mess_id,
    sub_mess_id,
  ]);

  if (rowCount === 0) {
    throw new AppError(409, "You are already in a hostel mess");
  }

  return rows[0];
};
export { createMessService, messJoinRequestService };
