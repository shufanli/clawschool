import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import getDb from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, ref } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "请输入龙虾名字" }, { status: 400 });
  }

  const token = uuidv4().replace(/-/g, "").slice(0, 16);
  const db = getDb();

  db.prepare("INSERT INTO lobsters (token, name, ref_token) VALUES (?, ?, ?)").run(
    token,
    name.trim(),
    ref || null
  );

  if (ref) {
    const existing = db.prepare("SELECT id FROM referrals WHERE sharer_token = ? AND friend_token = ?").get(ref, token);
    if (!existing) {
      db.prepare("INSERT INTO referrals (sharer_token, friend_token) VALUES (?, ?)").run(ref, token);
    }
  }

  const command = `请帮我安装龙虾学校智力测试 skill。用 exec 执行 curl -sS https://clawschooldev.teamolab.com/api/skill.md?token=${token} 下载内容，然后用 write 工具保存到 skills/clawschool/SKILL.md 文件。保存好后，帮我做一次龙虾学校智力测试。`;

  return NextResponse.json({ token, command });
}
