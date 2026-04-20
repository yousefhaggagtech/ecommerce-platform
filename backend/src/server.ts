import dotenv from "dotenv";
import path from "path";

// Load environment variables BEFORE anything else
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); 

import 'module-alias/register';

// Now it's safe to use dynamic imports with module aliases
import mongoose from "mongoose";
import app from "./app.js";

const DB_URI = process.env.DATABASE_URI || "";
if (!DB_URI.startsWith("mongodb")) {
    console.error("CRITICAL: DATABASE_URI is missing or incorrect in .env file!");
}
mongoose
  .connect(DB_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => {
    console.log("Mongoose Connection Error: ❌");
    console.log(err);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

