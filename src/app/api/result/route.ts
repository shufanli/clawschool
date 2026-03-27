import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const db = getDb();
  const lobster = db.prepare("SELECT * FROM lobsters WHERE token = ?").get(token) as { name: string; token: string } | undefined;

  if (!lobster) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  const results = db.prepare(
    "SELECT * FROM test_results WHERE token = ? ORDER BY created_at DESC"
  ).all(token) as {
    id: number; scores: string; total_score: number; speed_bonus: number;
    skill_bonus: number; iq_score: number; title: string; badge: string;
    percentile: number; duration_seconds: number; model: string; created_at: string;
  }[];

  if (results.length === 0) {
    return NextResponse.json({ error: "No results found" }, { status: 404 });
  }

  const latest = results[0];

  // Get rank
  const allScores = db.prepare(`
    SELECT l.token, r.iq_score FROM lobsters l
    JOIN test_results r ON r.token = l.token
    WHERE r.id = (SELECT id FROM test_results WHERE token = l.token ORDER BY created_at DESC LIMIT 1)
    ORDER BY r.iq_score DESC, r.duration_seconds ASC
  `).all() as { token: string; iq_score: number }[];

  const rank = allScores.findIndex((s) => s.token === token) + 1;
  const totalParticipants = allScores.length;

  // Get upgrades
  const upgrades = db.prepare(
    "SELECT * FROM upgrades WHERE token = ? AND status = 'completed'"
  ).all(token) as { selected_qids: string }[];

  const unlockedQids = new Set<string>();
  for (const u of upgrades) {
    const qids = JSON.parse(u.selected_qids) as string[];
    qids.forEach((q) => unlockedQids.add(q));
  }

  // History for growth chart
  const history = results.map((r) => ({
    iq_score: r.iq_score,
    created_at: r.created_at,
  })).reverse();

  return NextResponse.json({
    name: lobster.name,
    token: lobster.token,
    iq_score: latest.iq_score,
    title: latest.title,
    badge: latest.badge,
    percentile: latest.percentile,
    scores: JSON.parse(latest.scores),
    speed_bonus: latest.speed_bonus,
    skill_bonus: latest.skill_bonus,
    duration_seconds: latest.duration_seconds,
    model: latest.model,
    rank,
    total_participants: totalParticipants,
    unlocked_qids: Array.from(unlockedQids),
    history,
  });
}
