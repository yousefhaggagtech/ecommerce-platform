import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "@/models/userModel.js";
import AppError from "@/utils/AppError.js";
import { catchError } from "@/utils/catchError.js";

interface JwtPayload {
  id: string;
  role: string;
}

// ─── Protect ─────────────────────────────────────────────────────────────────
// Verifies the Access Token and attaches the user to req.user

export const protect = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract token from Authorization header
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in", 401));
    }

    // 2. Verify access token signature and expiry
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      ) as JwtPayload;
    } catch {
      return next(new AppError("Invalid or expired access token", 401));
    }

    // 3. Confirm the user still exists in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    // 4. Attach user to request for downstream handlers
    (req as any).user = user;
    next();
  }
);

// ─── Restrict To ─────────────────────────────────────────────────────────────
// Restricts a route to specific roles — must be used after protect

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};