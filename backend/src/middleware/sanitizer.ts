import type { Request, Response, NextFunction } from "express";
import { filterXSS } from "xss";

/**
 * Recursively cleans an object from NoSQL injection and XSS scripts.
 * Modifies the object in-place to stay compatible with Express 5 getters.
 */
const sanitizeData = (obj: any): void => {
  if (!obj || typeof obj !== "object") return;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // 1. Handle NoSQL Injection ($ and .)
    if (key.startsWith("$") || key.includes(".")) {
      const safeKey = key.replace(/\$/g, "_").replace(/\./g, "_");
      obj[safeKey] = value;
      delete obj[key];
      // Continue sanitizing the value under the new key
      sanitizeData(obj[safeKey]);
    } 
    // 2. Handle XSS for strings
    else if (typeof value === "string") {
      obj[key] = filterXSS(value);
    } 
    // 3. Deep sanitization for nested objects
    else if (typeof value === "object") {
      sanitizeData(value);
    }
  });
};

/**
 * Unified Middleware for Mongo Injection and XSS Protection
 */
const sanitizer = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) sanitizeData(req.body);
  if (req.params) sanitizeData(req.params);
  if (req.query) sanitizeData(req.query);

  next();
};

export default sanitizer;