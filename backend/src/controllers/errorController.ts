import type { NextFunction, Request, Response } from "express";
import AppError from "@/utils/AppError.js";

/**
 * Handles MongoDB CastErrors (e.g., passing a string that isn't a valid ObjectId)
 */
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handles MongoDB Duplicate Key Errors (e.g., trying to register an existing email)
 */
const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = Object.values(err.keyValue).join(", ");
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handles Mongoose Validation Errors (e.g., password length, required fields)
 */
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => (el as any).message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * Handles JWT Authentication Errors (Invalid Token)
 */
const handleJWTError = (): AppError => 
  new AppError('Invalid token. Please log in again!', 401);

/**
 * Handles JWT Expiration Errors
 */
const handleJWTExpiredError = (): AppError => 
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Sends detailed error information during development (includes stack trace)
 */
const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Sends clean, user-friendly error messages during production
 */
const sendErrorProd = (err: AppError, res: Response) => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } 
  // B) Programming or unknown error: don't leak details to the client
  else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

/**
 * Main Global Error Handling Middleware
 * Intercepts all errors, transforms library-specific errors, and sends the response
 */
const globalErrorHandler = (
  err: any, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
) => {
  // 1) Initialize default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // 2) Create a copy of the error to avoid mutating the original object
  // and ensure 'name' and 'message' are preserved
  let error = { ...err, name: err.name, message: err.message };

  // 3) Identify and Transform specific Mongoose/JWT errors into AppErrors (Operational Errors)
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // 4) Choose response style based on Environment
  if (process.env.NODE_ENV === "development") {
    // We pass the 'error' (the transformed one) so we see the 400 status in Dev
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error as AppError, res);
  }
};

export default globalErrorHandler;