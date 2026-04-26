import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/models/userModel.js";
import AppError from "@/utils/AppError.js";
import { catchError } from "@/utils/catchError.js";

// ─── Cookie Config ────────────────────────────────────────────────────────────

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,                                    // JS cannot access this cookie
  secure:   process.env.NODE_ENV === "production",   // HTTPS only in production
  sameSite: "strict" as const,                       // CSRF protection
  maxAge:   15 * 60 * 1000,                          // 15 minutes in ms
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge:   14 * 24 * 60 * 60 * 1000,               // 14 days in ms
};

// ─── Token Generators ─────────────────────────────────────────────────────────

const signAccessToken = (id: string, role: string): string => {
  return jwt.sign(
    { id, role },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "15m" }
  );
};

const signRefreshToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "14d" }
  );
};

// ─── Helper: set tokens as httpOnly cookies ───────────────────────────────────

const sendTokens = async (
  user: any,
  statusCode: number,
  res: Response
): Promise<void> => {
  const accessToken  = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  // Store hashed refresh token in DB — never the raw value
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save({ validateBeforeSave: false });

  // Set tokens as httpOnly cookies — JS cannot read these
  res.cookie("accessToken",  accessToken,  ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  // Return user data only — no tokens in response body
  res.status(statusCode).json({
    status: "success",
    data: {
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    },
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already exists", 409));
    }

    const user = await User.create({ name, email, password });
    await sendTokens(user, 201, res);
  }
);

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid credentials", 401));
    }

    await sendTokens(user, 200, res);
  }
);

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refresh = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    // Read refresh token from cookie — not from request body
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 401));
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch {
      return next(new AppError("Invalid or expired refresh token", 403));
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) {
      return next(new AppError("User not found", 403));
    }

    const isValid = await user.compareRefreshToken(refreshToken);
    if (!isValid) {
      return next(new AppError("Refresh token mismatch", 403));
    }

    // Issue new access token and set it as a cookie
    const newAccessToken = signAccessToken(user._id, user.role);
    res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);

    res.status(200).json({ status: "success" });
  }
);

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken;

    // Clear cookies immediately regardless of token validity
    res.clearCookie("accessToken",  { httpOnly: true, sameSite: "strict" });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });

    if (!refreshToken) {
      return res.status(204).send();
    }

    // Silently try to invalidate the refresh token in DB
    try {
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      );
      const user = await User.findById(decoded.id).select("+refreshToken");
      if (user) {
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
      }
    } catch {
      // Token already invalid — still return success
    }

    res.status(204).send();
  }
);

// ─── Get Me ───────────────────────────────────────────────────────────────────

export const getMe = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      data: { user: (req as any).user },
    });
  }
);