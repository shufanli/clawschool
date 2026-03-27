import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const db = getDb();
  const lobster = db.prepare("SELECT * FROM lobsters WHERE token = ?").get(token) as { status: string; name: string } | undefined;

  if (!lobster) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  const result = db.prepare("SELECT * FROM test_results WHERE token = ? ORDER BY created_at DESC LIMIT 1").get(token);

  return NextResponse.json({
    status: result ? "done" : "pending",
    name: lobster.name,
    has_result: !!result,
  });
}
