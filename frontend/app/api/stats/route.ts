import { NextResponse } from "next/server";
import { getCityStats } from "@/lib/supabase-api";

export async function GET() {
  try {
    const data = await getCityStats();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
