import app from "./app";
import { env } from "./config/env";

import fs from "fs";
import path from "path";

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
  console.error("❌ Unable to read database stats");
  console.error(err);
}

console.log("================================================");

app.listen(env.PORT, () => {
  console.log(`✅ Server running on port ${env.PORT}`);
});