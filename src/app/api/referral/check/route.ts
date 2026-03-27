import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const db = getDb();
  const referral = db.prepare(
    "SELECT * FROM referrals WHERE sharer_token = ? AND friend_completed = 1 AND reward_claimed = 0 LIMIT 1"
  ).get(token) as { id: number; friend_token: string } | undefined;

  return NextResponse.json({
    has_eligible_referral: !!referral,
    referral_id: referral?.id,
  });
}
