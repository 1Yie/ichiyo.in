import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let clients: ReadableStreamDefaultController[] = [];
let version = ""; // 当前版本

// SSE 发送消息函数
function sendToClients(data: string) {
  const payload = `event: version\ndata: ${data}\n\n`;
  const encoded = new TextEncoder().encode(payload);
  clients.forEach((client) => client.enqueue(encoded));
}

// 监听 version.json 文件变化
const versionFile = path.join(process.cwd(), "public", "version.json");
fs.watch(versionFile, async () => {
  try {
    const content = await fs.promises.readFile(versionFile, "utf-8");
    const json = JSON.parse(content);
    if (json.version && json.version !== version) {
      version = json.version;
      sendToClients(JSON.stringify({ version }));
      console.log("version.json changed, notified clients:", version);
    }
  } catch (err) {
    console.error("Failed to read version.json:", err);
  }
});

export const GET = async (req: Request) => {
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const body = new ReadableStream({
    start(controller) {
      // 保存客户端
      clients.push(controller);

      // 发送初始心跳
      controller.enqueue(new TextEncoder().encode(`event: heartbeat\ndata: {}\n\n`));

      // 客户端断开连接时移除
      req.signal.addEventListener("abort", () => {
        clients = clients.filter((c) => c !== controller);
      });
    },
  });

  return new NextResponse(body, { headers });
};
