import pool from "../../config/db.js";
import { userAndProfileCTEQuery } from "./auth.query.js";

const getOrCreateUserServe = async ({ fname, email, avatar_url }) => {
  const images = avatar_url ? [{ url: avatar_url, public_id: null }] : [];
  const { rows } = await pool.query(userAndProfileCTEQuery, [
    email,
    fname,
    JSON.stringify(images),
  ]);
  return rows[0];
};

const setRedirectPathServe = ({ role, mess_role }) => {
  return !mess_role
    ? "/onboard"
    : mess_role === "owner"
      ? "/dashboard/owner"
      : mess_role === "manager"
        ? "/dashboard/manager"
        : "/dashboard/member";
};

export { getOrCreateUserServe, setRedirectPathServe };
