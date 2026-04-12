import express from "express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import sanitizer from "./middleware/sanitizer.js";
import globalErrorHandler from "@/controllers/errorController.js";
import corsOptions from "@/config/corsOptions.js";
import AppError from "@/utils/AppError.js";
import authRoutes from "@/routes/authRouter.js";
import productRoutes from "@/routes/productRouter.js";
import orderRoutes from "@/routes/orderRouter.js";
const app = express();

/**
 * Purpose: Sets up the web server to handle requests and responses.
 * Features:
 * - Provides routing for different endpoints.
 * - Integrates middlewares to enhance functionality, security, and debugging.
 * Example:
 * - Handles an incoming `GET /` request and sends a response.
 */

// Middleware Setup

app.use(helmet());
/**
 * Middleware: helmet
 * Purpose: Enhances security by setting appropriate HTTP headers.
 * Features:
 * - Prevents common vulnerabilities like XSS, clickjacking, and MIME sniffing.
 * Example:
 * - Adds the `X-Content-Type-Options: nosniff` header to prevent browsers from interpreting files as a different MIME type.
 * Usage:
 * - Automatically secures your API with default settings.
 */

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
/**
 * Middleware: morgan
 * Purpose: Logs HTTP requests for debugging and monitoring purposes.
 * Modes:
 * - "dev": Provides concise colored logs for development.
 * - "combined": Detailed logs for production, including timestamps and response statuses.
 * Example:
 * - Logs: "GET /home 200 5.432 ms - 13"
 */

app.use(express.json({ limit: "10kb" }));
/**
 * Middleware: express.json()
 * Purpose: Parses incoming JSON payloads in requests.
 * Features:
 * - Restricts payload size to 10kb to prevent Denial of Service (DoS) attacks.
 * Example:
 * - Incoming request: `{ "name": "John" }`
 * - Accessible in code: `req.body.name === "John"`
 */

app.use(express.urlencoded({ extended: false }));
/**
 * Middleware: express.urlencoded()
 * Purpose: Parses incoming URL-encoded payloads, such as form submissions.
 * Features:
 * - Handles data like `name=John&age=30`.
 * - With `extended: false`, only supports simple objects, not nested ones.
 * Example:
 * - Incoming form: `<form><input name="name" value="John"></form>`
 * - Accessible in code: `req.body.name === "John"`
 */

app.use(sanitizer);
/**{
  "username": { "$gt": "" },
  "password": "anyPassword"
}
This matches any user in the database because $gt bypasses the need for a specific username.

 * Middleware: express-mongo-sanitize
 * Purpose: Prevents NoSQL Injection attacks.
 * How It Works:
 * - Strips out `$` and `.` from request data to avoid malicious MongoDB queries.
 * Example:
 * - Malicious input: `{ "$gt": "" }`
 * - Sanitized output: `{ }`
 */



app.use(cookieParser());
/**
 * Middleware: cookieParser
 * Purpose: Parses cookies from incoming requests.
 * Use Case:
 * - Essential for authentication and session management.
 * Example:
 * - Incoming header: `Cookie: userId=12345`
 * - Accessible in code: `req.cookies.userId === "12345"`
 */
//@ts-ignore
app.use(cors(corsOptions));
/**
 * Middleware: cors
 * Purpose: Enables Cross-Origin Resource Sharing (CORS).
 * Use Case:
 * - Allows your API to handle requests from other domains securely.
 * Options:
 * - `credentials: true`: Supports cookies and authentication headers across domains.
 * - `origin: true`: Dynamically allows all origins.
 * Example:
 * - Frontend hosted on `http://example.com` can access API on `http://api.example.com`.
 */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
/**
  * Route Handling
 */

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
export default app;

/**
 * Error Handling Middleware
 * Note:
 * - Errors occurring after this point can be caught and processed by error-handling middleware.
 * - Example: If an uncaught error occurs, it will propagate to a middleware designed to handle it.
 */