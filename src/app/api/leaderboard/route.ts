import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getTitleForIQ } from "@/lib/titles";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();

  const rows = db.prepare(`
    SELECT l.token, l.name, r.iq_score, r.title
    FROM lobsters l
    JOIN test_results r ON r.token = l.token
    WHERE r.id = (
      SELECT id FROM test_results WHERE token = l.token ORDER BY created_at DESC LIMIT 1
    )
    ORDER BY r.iq_score DESC, r.duration_seconds ASC
    LIMIT 100
  `).all() as { token: string; name: string; iq_score: number; title: string }[];

  const entries = rows.map((row, index) => ({
    rank: index + 1,
    token: row.token,
    name: row.name,
    iq_score: row.iq_score,
    title: row.title || getTitleForIQ(row.iq_score).title,
  }));

  return NextResponse.json({ entries, total: entries.length });
}
