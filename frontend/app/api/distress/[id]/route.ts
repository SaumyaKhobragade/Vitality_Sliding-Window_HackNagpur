import { NextResponse } from "next/server";
import { updateDistressEventStatus } from "@/lib/supabase-api";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { status, resolutionNotes } = body;

    if (!status || !["confirmed", "dismissed", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const result = await updateDistressEventStatus(
      params.id,
      status,
      resolutionNotes,
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update distress event" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating distress event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
