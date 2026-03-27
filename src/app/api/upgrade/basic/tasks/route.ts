import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import getDb from "@/lib/db";
import { getQuestion } from "@/lib/questions";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, selected_qids } = body;

  if (!token || !selected_qids || !Array.isArray(selected_qids) || selected_qids.length === 0) {
    return NextResponse.json({ error: "Missing token or selected_qids" }, { status: 400 });
  }

  const db = getDb();
  const lobster = db.prepare("SELECT * FROM lobsters WHERE token = ?").get(token);
  if (!lobster) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  const taskId = uuidv4().replace(/-/g, "").slice(0, 16);

  const selectedSkills = selected_qids.map((qid: string) => {
    const q = getQuestion(qid);
    return q ? { qid, name: q.name, package: q.skillPackage } : null;
  }).filter(Boolean);

  db.prepare("INSERT INTO upgrades (token, task_id, selected_qids) VALUES (?, ?, ?)").run(
    token,
    taskId,
    JSON.stringify(selected_qids)
  );

  const skillUrl = `https://clawschooldev.teamolab.com/api/skill.md?token=${token}&task_id=${taskId}`;
  const commandText = `请帮我升级龙虾学校能力。用 exec 执行 curl -sS "${skillUrl}" 下载内容，然后用 write 工具保存到 skills/clawschool/SKILL.md 文件。保存好后，按照文件中的指令完成升级任务。`;

  return NextResponse.json({
    task_id: taskId,
    selected_qids,
    selected_skills: selectedSkills,
    skill_url: skillUrl,
    command_text: commandText,
  });
}
