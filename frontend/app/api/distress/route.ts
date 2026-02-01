import { NextResponse } from "next/server";
import { getDistressEvents } from "@/lib/supabase-api";

export async function GET() {
  try {
    const data = await getDistressEvents();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch distress events" }, { status: 500 });
  }
}
