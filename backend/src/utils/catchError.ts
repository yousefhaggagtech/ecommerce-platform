import type { Request, Response, NextFunction } from "express";

/**
 * A wrapper function for asynchronous express routes.
 * It catches any errors that occur during the execution of the function 
 * and passes them to the next middleware (Global Error Handler).
 */
export const catchError = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute the controller function and catch any rejected promises
    fn(req, res, next).catch((err: any) => next(err));
  };
};