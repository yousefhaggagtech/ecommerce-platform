import type { Request, Response, NextFunction } from "express";
import { filterXSS } from "xss";

/**
 * Cleans an object from NoSQL injection ($ and . characters).
 * Used for query parameters to prevent query operator injection.
 */
const sanitizeNoSQLInjection = (obj: any): void => {
  if (!obj || typeof obj !== "object") return;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // Handle NoSQL Injection ($ and .) in keys
    if (key.startsWith("$") || key.includes(".")) {
      const safeKey = key.replace(/\$/g, "_").replace(/\./g, "_");
      obj[safeKey] = value;
      delete obj[key];
      // Continue sanitizing the value under the new key
      sanitizeNoSQLInjection(obj[safeKey]);
    } 
    // Deep sanitization for nested objects
    else if (typeof value === "object") {
      sanitizeNoSQLInjection(value);
    }
  });
};

/**
 * Cleans an object from NoSQL injection AND XSS scripts.
 * Used for body/params where user data will be stored or rendered.
 */
const sanitizeDataWithXSS = (obj: any): void => {
  if (!obj || typeof obj !== "object") return;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // 1. Handle NoSQL Injection ($ and .)
    if (key.startsWith("$") || key.includes(".")) {
      const safeKey = key.replace(/\$/g, "_").replace(/\./g, "_");
      obj[safeKey] = value;
      delete obj[key];
      sanitizeDataWithXSS(obj[safeKey]);
    } 
    // 2. Handle XSS for strings
    else if (typeof value === "string") {
      obj[key] = filterXSS(value);
    } 
    // 3. Deep sanitization for nested objects
    else if (typeof value === "object") {
      sanitizeDataWithXSS(value);
    }
  });
};

/**
 * Middleware for Request Sanitization
 * - req.query: NoSQL injection protection only (used for database queries)
 * - req.body & req.params: NoSQL injection + XSS protection (user-supplied data)
 */
const sanitizer = (req: Request, _res: Response, next: NextFunction) => {
  // Query parameters: Only NoSQL injection protection (no XSS filter)
  if (req.query) sanitizeNoSQLInjection(req.query);
  
  // Body & Params: Full sanitization (NoSQL + XSS)
  if (req.body) sanitizeDataWithXSS(req.body);
  if (req.params) sanitizeDataWithXSS(req.params);

  next();
};

export default sanitizer;