import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";



export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "slides.json");
    console.log(filePath);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error("读取 JSON 出错：", error);
    return NextResponse.json({ error: "无法读取数据" }, { status: 500 });
  }
}
