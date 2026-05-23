import { uploadToCloudinary } from "../../config/cloudinary.js";
import {
  checkUserIsInMessQuery,
  getSubMessListQuery,
  messCreationCTEQuery,
  messJoinReqQuery,
} from "./onboard.query.js";
import pool from "../../config/db.js";
import AppError from "../../utils/appError.js";
import {
  checkUserIsInMessRepo,
  createMessRepo,
  getSubMessListRepo,
  messJoinReqRepo,
} from "./onboard.repository.js";

export const createMessService = async ({ file, fname, user_id }) => {
  const rowCount = await checkUserIsInMessRepo({ user_id });
  if (rowCount > 0) {
    throw new AppError(409, "User already in a mess");
  }
  let images = [];
  if (file) {
    const result = await uploadToCloudinary(file.buffer);
    images = [{ url: result.secure_url, public_id: result.public_id }];
  }
  images = JSON.stringify(images);
  const results = await createMessRepo({
    fname,
    images,
    sub_mess_name: "Block-1",
    user_id,
  });

  return results;
};

export const messJoinRequestService = async ({
  user_id,
  mess_id,
  sub_mess_id,
}) => {
  const { rows, rowCount } = await messJoinReqRepo({
    user_id,
    mess_id,
    sub_mess_id,
  });

  if (rowCount === 0) {
    throw new AppError(409, "You are already in a hostel mess");
  }

  return rows[0];
};

export const getSubMessListService = async ({ mess_id }) => {
  const rows = await getSubMessListRepo({ mess_id });
  if (rows.length === 0) {
    throw new AppError(404, "No mess found with that ID");
  }
  return rows;
};
