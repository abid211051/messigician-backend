const PG_ERROR_CODES = {
  23505: { status: 409, message: "Duplicate entry not allowed" },
  23503: { status: 409, message: "Referenced record does not exist" },
  23502: { status: 400, message: "Required field is missing" },
  23514: { status: 400, message: "Value violates check constraint" },
  42703: { status: 400, message: "Column does not exist" },
  "22P02": { status: 400, message: "Invalid input syntax" },
  "42P01": { status: 500, message: "Table does not exist" },
};

export const pgErrorHandler = (err) => {
  const pgError = PG_ERROR_CODES[err.code];
  if (!pgError) return null;
  return pgError;
};

class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default AppError;
