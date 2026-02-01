import { NextResponse } from "next/server";
import { getRedirectionDecisions } from "@/lib/supabase-api";

export async function GET() {
  try {
    const data = await getRedirectionDecisions();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
