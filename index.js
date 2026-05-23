import "./config/env.js";
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
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = null;

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  }

  // 2. Custom App Errors
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 3. JWT Errors
  else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    statusCode = 401;
    message = "Invalid or expired token";
  }

  // 4. Database Errors
  else {
    const pgError = pgErrorHandler(err);
    if (pgError) {
      statusCode = pgError.status;
      message = pgError.message;
    }
  }

  // Log the actual error for the backend team
  if (statusCode === 500) console.error(err);

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
});

app.listen(process.env.PORT, () => {
  console.log("server running at port:", process.env.PORT);
});
