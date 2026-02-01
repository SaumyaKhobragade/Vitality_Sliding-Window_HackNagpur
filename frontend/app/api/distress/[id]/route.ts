import { NextResponse } from "next/server";
import { updateDistressEventStatus } from "@/lib/supabase-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      resolutionNotes,
      resolvedBy,
      clinicalNotes,
      priorityDelta,
    } = body;

    if (
      !status ||
      ![
        "CONFIRMED",
        "DISMISSED",
        "RESOLVED",
        "confirmed",
        "dismissed",
        "resolved",
      ].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const result = await updateDistressEventStatus(
      id,
      status,
      resolutionNotes,
      resolvedBy,
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
