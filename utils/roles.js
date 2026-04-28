import AppError from "./appError.js";

export const isVerifiedRole = (...allowableRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized"));
    }
    if (!allowableRoles.includes(req.user.mess_role)) {
      return next(new AppError(403, "Forbidden"));
    }
    next();
  };
};
