import { NextResponse } from "next/server";
import { getHospitalById } from "@/lib/supabase-api";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await getHospitalById(id);
    if (!data) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hospital" }, { status: 500 });
  }
}
