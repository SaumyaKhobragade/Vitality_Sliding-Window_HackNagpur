import { NextResponse } from "next/server";
import { getHospitals } from "@/lib/supabase-api";

export async function GET() {
  try {
    const data = await getHospitals();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hospitals" }, { status: 500 });
  }
}
