import jwt from "jsonwebtoken";
import { cookieOptions, cookieParser } from "./cookieOptions.js";
import pool from "../config/db.js";
import { findAUser } from "../modules/auth/auth.query.js";
import AppError from "./appError.js";

const createJwtToken = (expireIn, payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expireIn });
};

const verifyJwtToken = (req, res, next) => {
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

const refreshAccessToken = async (req, res, next) => {
  const refreshToken = cookieParser(req.headers.cookie).get("refreshToken");
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const { rows } = await pool.query(findAUser, [decoded.email]);
    if (rows[0]?.ban) {
      throw new AppError(401, "Account has been banned");
    }
    const payload = {
      id: rows[0].id,
      email: rows[0].email,
      role: rows[0].role,
    };
    const accessToken = createJwtToken("5m", payload);
    res.cookie("accessToken", accessToken, cookieOptions(5 * 60 * 1000));
    return res.status(201).json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};

export { createJwtToken, verifyJwtToken, refreshAccessToken };
