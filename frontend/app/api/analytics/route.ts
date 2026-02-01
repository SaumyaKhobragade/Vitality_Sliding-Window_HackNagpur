import { NextResponse } from "next/server";
import { getAnalyticsSnapshots } from "@/lib/supabase-api";

export async function GET() {
  try {
    const data = await getAnalyticsSnapshots();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
