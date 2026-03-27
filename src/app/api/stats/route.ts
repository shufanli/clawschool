import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const result = db.prepare("SELECT COUNT(DISTINCT token) as count FROM test_results").get() as { count: number };
  return NextResponse.json({ total_tested: result?.count || 0 });
}
