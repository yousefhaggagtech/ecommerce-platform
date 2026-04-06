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
  // Extract the duplicate value from the error object
  const value = Object.values(err.keyValue).join(", ");
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handles Mongoose Validation Errors (e.g., required fields or minLength violations)
 */
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * Handles JWT Authentication Errors (Invalid Token)
 */
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again!', 401);

/**
 * Handles JWT Expiration Errors
 */
const handleJWTExpiredError = () => 
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Sends detailed error information during development
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
    // 1) Log error to console for the developer
    console.error("ERROR 💥", err);

    // 2) Send a generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

/**
 * Main Global Error Handling Middleware
 */
const globalErrorHandler = (
  err: any, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
) => {
  // Set default status code and status if not present
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    // 1. Create a copy of the error and ensure message/name are preserved
    let error = { ...err, message: err.message, name: err.name };

    // 2. Identify and transform specific library errors into AppErrors
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // 3. Send the formatted error
    sendErrorProd(error as AppError, res);
  }
};

export default globalErrorHandler;