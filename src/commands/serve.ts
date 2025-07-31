// src/commands/serve.ts
import "reflect-metadata";
import "../container";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { db } from "../db";
import { app } from "../app";

export const serve = async () => {
  const PORT = process.env.PORT || 3000;

  try {
    db; // initialize Drizzle
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};
