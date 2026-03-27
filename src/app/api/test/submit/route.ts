import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getTitleForIQ, calculateIQ } from "@/lib/titles";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token, scores, duration_seconds, model, upgrade_task_id } = body;

  if (!token || !scores) {
    return NextResponse.json({ error: "Missing token or scores" }, { status: 400 });
  }

  const db = getDb();
  const lobster = db.prepare("SELECT * FROM lobsters WHERE token = ?").get(token) as { name: string } | undefined;

  if (!lobster) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  // Calculate speed bonus
  let speedBonus = 0;
  const dur = duration_seconds || 0;
  if (dur <= 30) {
    speedBonus = 20;
  } else if (dur <= 120) {
    speedBonus = Math.max(0, 20 - Math.floor((dur - 30) / 9));
  } else if (dur <= 420) {
    speedBonus = Math.max(1, 10 - Math.floor((dur - 120) / 30));
  }

  // Calculate skill bonus from q12
  const skillBonus = typeof scores.q12 === "number" ? scores.q12 : 0;

  const iqScore = calculateIQ(scores, speedBonus, skillBonus);
  const titleInfo = getTitleForIQ(iqScore);

  // Calculate percentile
  const totalCount = (db.prepare("SELECT COUNT(DISTINCT token) as c FROM test_results").get() as { c: number }).c;
  const belowCount = totalCount > 0
    ? (db.prepare("SELECT COUNT(DISTINCT token) as c FROM test_results WHERE iq_score < ?").get(iqScore) as { c: number }).c
    : 0;
  const percentile = totalCount > 0 ? Math.round((belowCount / totalCount) * 100) : 50;

  db.prepare(`
    INSERT INTO test_results (token, scores, total_score, speed_bonus, skill_bonus, iq_score, title, badge, percentile, duration_seconds, model)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    token,
    JSON.stringify(scores),
    Object.entries(scores).filter(([k]) => k !== "q12").reduce((s, [, v]) => s + (v as number), 0),
    speedBonus,
    skillBonus,
    iqScore,
    titleInfo.title,
    titleInfo.badge,
    percentile,
    dur,
    model || ""
  );

  // Update lobster status
  db.prepare("UPDATE lobsters SET status = 'done' WHERE token = ?").run(token);

  // Update referral if friend completed
  db.prepare("UPDATE referrals SET friend_completed = 1 WHERE friend_token = ?").run(token);

  // If this is an upgrade task, mark it completed
  if (upgrade_task_id) {
    db.prepare("UPDATE upgrades SET status = 'completed', completed_at = datetime('now') WHERE task_id = ?").run(upgrade_task_id);
  }

  return NextResponse.json({
    iq_score: iqScore,
    title: titleInfo.title,
    badge: titleInfo.badge,
    percentile,
    speed_bonus: speedBonus,
    skill_bonus: skillBonus,
    scores,
  });
}
