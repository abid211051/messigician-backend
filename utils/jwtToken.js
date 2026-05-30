import jwt from "jsonwebtoken";
import { cookieOptions, cookieParser } from "./optionsParserFomater.js";
import pool from "../config/db.js";
import { findAUser } from "../modules/auth/auth.query.js";
import AppError from "./appError.js";
import {
  ACCESSTOKEN_EXPIREY_MIN,
  REFRESHTOKEN_EXPIREY_DAY,
} from "./constants.js";

export const setAccessToken = ({ payload, res }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESSTOKEN_EXPIREY_MIN * 60,
  });
  res.cookie(
    "accessToken",
    token,
    cookieOptions(ACCESSTOKEN_EXPIREY_MIN * 60 * 1000),
  );
};

export const setRefreshToken = ({ payload, res }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: REFRESHTOKEN_EXPIREY_DAY * 24 * 60 * 60,
  });
  res.cookie(
    "refreshToken",
    token,
    cookieOptions(REFRESHTOKEN_EXPIREY_DAY * 24 * 60 * 60 * 1000),
  );
};

export const verifyJwtToken = (req, res, next) => {
  const accessToken = cookieParser(req.headers.cookie).get("accessToken");
  if (!accessToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  const refreshToken = cookieParser(req.headers.cookie).get("refreshToken");
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const { rows } = await pool.query(findAUser, [decoded.email]);
    if (!rows.length) {
      throw new AppError(404, "User not found");
    }
    if (rows[0]?.ban) {
      throw new AppError(401, "Account has been banned");
    }
    const payload = {
      id: rows[0].id,
      email: rows[0].email,
      mess_role: rows[0].mess_role,
      mess_id: rows[0].mess_id,
      sub_mess_id: rows[0].sub_mess_id,
    };
    setAccessToken({
      payload,
      res,
    });
    return res.status(201).json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};
