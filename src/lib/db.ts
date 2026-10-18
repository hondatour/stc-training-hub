import { PrismaClient } from "@prisma/client";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function ensureDbFile() {
  // Get DATABASE_URL (default to local file if not set)
  const dbUrl = process.env.DATABASE_URL || "file:./db/custom.db";

  // If it's a file URL, make sure the directory exists
  if (dbUrl.startsWith("file:")) {
    const filePath = dbUrl.replace("file:", "").replace(/^\.\//, "");
    const absPath = join(process.cwd(), filePath);
    const dir = dirname(absPath);
    try {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    } catch (e) {
      // Directory might not be writable — that's OK, Prisma will throw a clearer error
      console.warn("Could not create DB directory:", dir, e);
    }
  }
}

// Ensure the DB file directory exists before creating PrismaClient
ensureDbFile();

// Plain SQLite PrismaClient. No adapters.
// Works with file:./db/custom.db (local) or file:/data/custom.db (Railway volume)
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
