import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "@/models/userModel.js";
import AppError from "@/utils/AppError.js";
import { catchError } from "@/utils/catchError.js";

interface JwtPayload {
  id: string;
  role: string;
}

// ─── Protect ──────────────────────────────────────────────────────────────────
// Reads access token from httpOnly cookie — not from Authorization header

export const protect = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Read token from cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new AppError("You are not logged in", 401));
    }

    // 2. Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      ) as JwtPayload;
    } catch {
      return next(new AppError("Invalid or expired access token", 401));
    }

    // 3. Confirm user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    // 4. Attach user to request
    (req as any).user = user;
    next();
  }
);

// ─── Restrict To ──────────────────────────────────────────────────────────────

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