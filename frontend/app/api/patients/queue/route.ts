import { NextResponse } from "next/server";
import { getPatients } from "@/lib/supabase-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get("hospitalId");
    
    const data = await getPatients(hospitalId || undefined);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}
