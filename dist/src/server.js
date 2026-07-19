"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
console.log("process.cwd():", process.cwd());
console.log("process.env.DATABASE_URL:", process.env.DATABASE_URL || env_1.env.DATABASE_URL);
console.log("path.resolve('prisma/dev.db'):", path_1.default.resolve("prisma/dev.db"));
console.log("exists:", fs_1.default.existsSync(path_1.default.resolve("prisma/dev.db")));
app_1.default.listen(env_1.env.PORT, () => {
    console.log(`Server running on port ${env_1.env.PORT}`);
});
