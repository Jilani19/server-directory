import app from "./app";
import { env } from "./config/env";

import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";

const dbPath = path.resolve("prisma/dev.db");

console.log("================================================");
console.log("🚀 Server Startup Diagnostics");
console.log("================================================");

console.log("process.cwd():", process.cwd());
console.log("PORT:", env.PORT);
console.log("DATABASE_URL:", process.env.DATABASE_URL || env.DATABASE_URL);
console.log("Resolved DB Path:", dbPath);

console.log("------------------------------------------------");
console.log("Filesystem Checks");
console.log("------------------------------------------------");

console.log("Database exists:", fs.existsSync(dbPath));

try {
  fs.accessSync(dbPath, fs.constants.R_OK);
  console.log("✅ Database is READABLE");
} catch (err) {
  console.error("❌ Database is NOT READABLE");
  console.error(err);
}

try {
  fs.accessSync(dbPath, fs.constants.W_OK);
  console.log("✅ Database is WRITABLE");
} catch (err) {
  console.error("❌ Database is NOT WRITABLE");
  console.error(err);
}

try {
  const stat = fs.statSync(dbPath);
  console.log("Database Size:", stat.size, "bytes");
} catch (err) {
  console.error("❌ Unable to read file stats");
  console.error(err);
}

console.log("------------------------------------------------");
console.log("SQLite Direct Test");
console.log("------------------------------------------------");

const sqlite = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ SQLite OPEN FAILED");
    console.error(err);
  } else {
    console.log("✅ SQLite OPEN SUCCESS");

    sqlite.all(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
      [],
      (queryErr, rows: any[]) => {
        if (queryErr) {
          console.error("❌ SQLite QUERY FAILED");
          console.error(queryErr);
        } else {
          console.log(`✅ Total Tables: ${rows.length}`);

          rows.forEach((row) => {
            console.log(" -", row.name);
          });
        }

        sqlite.close((closeErr) => {
          if (closeErr) {
            console.error("❌ SQLite CLOSE FAILED");
            console.error(closeErr);
          } else {
            console.log("✅ SQLite CLOSED");
          }

          console.log("------------------------------------------------");
          console.log("Starting Express Server...");
          console.log("------------------------------------------------");

          app.listen(env.PORT, () => {
            console.log(`✅ Server running on port ${env.PORT}`);
          });
        });
      }
    );
  }
});