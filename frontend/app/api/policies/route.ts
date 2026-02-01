import { NextResponse } from "next/server";
import { getPolicies, updatePolicy } from "@/lib/supabase-api";

export async function GET() {
  try {
    const data = await getPolicies();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
        return NextResponse.json({ error: "Policy ID required" }, { status: 400 });
    }
    const updated = await updatePolicy(body.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
  }
}
