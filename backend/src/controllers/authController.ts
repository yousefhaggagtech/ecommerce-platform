import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "@/models/userModel.js";
import AppError from "@/utils/AppError.js";
import { catchError } from "@/utils/catchError.js";

// ─── Token Generators ────────────────────────────────────────────────────────

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

// ─── Helper: build and send token response ───────────────────────────────────

const sendTokens = async (
  user: any,
  statusCode: number,
  res: Response
): Promise<void> => {
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id);

  // Store hashed refresh token — never store the raw value
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save({ validateBeforeSave: false });

  res.status(statusCode).json({
    status: "success",
    accessToken,
    refreshToken,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

// ─── Register ────────────────────────────────────────────────────────────────

export const register = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // Reject if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already exists", 409));
    }

    const user = await User.create({ name, email, password });
    await sendTokens(user, 201, res);
  }
);

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    // Explicitly select password since it is excluded by default
    const user = await User.findOne({ email }).select("+password");

    // Return the same error for wrong email or wrong password (BR-006)
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid credentials", 401));
    }

    await sendTokens(user, 200, res);
  }
);

// ─── Refresh Token ───────────────────────────────────────────────────────────

export const refresh = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400));
    }

    // Verify token signature
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch {
      return next(new AppError("Invalid or expired refresh token", 403));
    }

    // Find user and include the stored refresh token hash
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) {
      return next(new AppError("User not found", 403));
    }

    // Validate submitted token against stored hash
    const isValid = await user.compareRefreshToken(refreshToken);
    if (!isValid) {
      return next(new AppError("Refresh token mismatch", 403));
    }

    // Issue a new access token only — refresh token stays the same
    const newAccessToken = signAccessToken(user.id, user.role);

    res.status(200).json({
      status: "success",
      accessToken: newAccessToken,
    });
  }
);

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400));
    }

    // Silently succeed if token is invalid — logout should always work client-side
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    } catch {
      return res.status(204).send();
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) return res.status(204).send();

    // Invalidate the refresh token
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    res.status(204).send();
  }
);

// ─── Get Me ──────────────────────────────────────────────────────────────────

export const getMe = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      data: {
        user: (req as any).user,
      },
    });
  }
);