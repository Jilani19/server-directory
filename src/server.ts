import app from "./app";
import { env } from "./config/env";

import fs from "fs";
import path from "path";

console.log("process.cwd():", process.cwd());
console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL || env.DATABASE_URL);
console.log("path.resolve('prisma/dev.db'):", path.resolve("prisma/dev.db"));
console.log("exists:", fs.existsSync(path.resolve("prisma/dev.db")));

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
