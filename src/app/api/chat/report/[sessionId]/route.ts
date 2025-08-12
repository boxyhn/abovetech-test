import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const { data: session, error } = await supabase
      .from("sessions")
      .select("analysis_result, status")
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error("Error fetching report:", error);
      return NextResponse.json(
        { error: "Failed to fetch report" },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "READY" || !session.analysis_result) {
      return NextResponse.json(
        { error: "Report not available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ report: session.analysis_result });
  } catch (error) {
    console.error("Error in report API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
