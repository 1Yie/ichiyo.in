import { WebSocketServer } from "ws";
import fs from "fs";
import path from "path";

const PORT = Number(process.env.WS_SERVER_PORT) || 3001;
const FILE_PATH = process.env.VERSION_FILE_PATH || "public/version.json";

const wss = new WebSocketServer({ port: PORT });

let currentVersion = JSON.parse(fs.readFileSync(path.join(process.cwd(), FILE_PATH), "utf-8")).version;

wss.on("connection", (ws) => {
  console.log("Client connected");

  // 初始推送当前版本
  ws.send(JSON.stringify({ type: "VERSION_UPDATE", version: currentVersion }));
});

// 监听 version.json 文件变化
const versionFile = path.join(process.cwd(), FILE_PATH);
fs.watch(versionFile, async () => {
  try {
    const content = await fs.promises.readFile(versionFile, "utf-8");
    const json = JSON.parse(content);
    if (json.version !== currentVersion) {
      currentVersion = json.version;
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: "VERSION_UPDATE", version: currentVersion }));
        }
      });
      console.log("New version pushed:", currentVersion);
    }
  } catch (err) {
    console.error("Failed to read version.json:", err);
  }
});

console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
