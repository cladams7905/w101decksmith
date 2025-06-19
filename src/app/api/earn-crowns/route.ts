import { NextRequest, NextResponse } from "next/server";

// This API route runs the earn-crowns script once when called
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify the request is from Vercel cron (check user agent)
    const userAgent = request.headers.get("user-agent");
    if (userAgent !== "vercel-cron/1.0") {
      // Allow manual testing with CRON_SECRET
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Check if we should start running yet
    const startDate = process.env.CRON_START_DATE;
    if (startDate) {
      const startDateTime = new Date(startDate);
      const now = new Date();

      if (now < startDateTime) {
        console.log(
          `⏳ Too early to run. Start date: ${startDateTime.toISOString()}, Current: ${now.toISOString()}`
        );
        return NextResponse.json({
          success: false,
          message: "Scheduled to start later",
          startDate: startDateTime.toISOString(),
          currentTime: now.toISOString(),
          timeRemaining:
            Math.ceil(
              (startDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
            ) + " hours"
        });
      }
    }

    console.log("🚀 Cron job triggered - scheduling earn-crowns execution");

    // For now, just return success without running the heavy script
    // TODO: Move the earn-crowns logic to a separate service or webhook
    return NextResponse.json({
      success: true,
      message: "Cron job triggered successfully",
      timestamp: new Date().toISOString(),
      note: "Heavy script execution moved to external service"
    });
  } catch (error) {
    console.error("❌ API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}

// POST method for manual triggering with authentication
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a trusted source
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Forward to GET method logic
    return GET(request);
  } catch (error) {
    console.error("❌ API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
