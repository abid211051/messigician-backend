import "dotenv/config";

import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import { pgErrorHandler } from "./utils/appError.js";
import AppError from "./utils/appError.js";

import routes from "./routes.js";

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  }),
);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Base path of all api routes.
app.use("/v1", routes);

// Global Error handling.
app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: err.ZodError.map((e) => ({
        field: e.path.jon("."),
        massage: e.message,
      })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  const pgError = pgErrorHandler(err);
  if (pgError) {
    return res.status(pgError.status).json({
      success: false,
      message: pgError.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(process.env.PORT, () => {
  console.log("server running at port:", process.env.PORT);
});
