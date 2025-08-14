import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM 下获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = new Date().toISOString().replace(/[:.-]/g, "");
const filePath = path.join(__dirname, "../public/version.json");

fs.writeFileSync(filePath, JSON.stringify({ version }), "utf-8");
console.log("Generated version.json:", version);
