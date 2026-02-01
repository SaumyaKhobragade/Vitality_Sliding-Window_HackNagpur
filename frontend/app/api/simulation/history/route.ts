import { NextResponse } from "next/server";
import { getSimulationLogs } from "@/lib/supabase-api";

export async function GET() {
  try {
    const data = await getSimulationLogs();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch simulation logs" }, { status: 500 });
  }
}
