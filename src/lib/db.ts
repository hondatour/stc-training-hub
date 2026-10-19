// Set DATABASE_URL before importing Prisma
// This ensures Prisma can find it at runtime
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./db/custom.db";
}

import { PrismaClient } from "@prisma/client";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function ensureDbFile() {
  const dbUrl = process.env.DATABASE_URL || "file:./db/custom.db";
  if (dbUrl.startsWith("file:")) {
    const filePath = dbUrl.replace("file:", "").replace(/^\.\//, "");
    const absPath = join(process.cwd(), filePath);
    const dir = dirname(absPath);
    try {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    } catch (e) {
      console.warn("Could not create DB directory:", dir, e);
    }
  }
}

ensureDbFile();

// Plain SQLite PrismaClient.
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
