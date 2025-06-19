import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// This API route runs the earn-crowns script once when called
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a trusted source
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    console.log("🚀 Starting earn-crowns script via cron trigger");

    // Run the earn-crowns script
    const scriptPath = path.join(process.cwd(), "scripts/earn-crowns.ts");

    return new Promise((resolve) => {
      const child = spawn(
        "ts-node",
        [
          "--project",
          path.join(process.cwd(), "scripts/tsconfig.json"),
          scriptPath
        ],
        {
          stdio: "pipe",
          cwd: process.cwd()
        }
      );

      let errorOutput = "";

      child.stderr?.on("data", (data) => {
        errorOutput += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          console.log("✅ Earn-crowns script completed successfully");
          resolve(
            NextResponse.json({
              success: true,
              message: "Script completed successfully",
              timestamp: new Date().toISOString()
            })
          );
        } else {
          console.error("❌ Earn-crowns script failed:", errorOutput);
          resolve(
            NextResponse.json(
              {
                success: false,
                error: "Script failed",
                exitCode: code,
                errorOutput: errorOutput.substring(0, 1000) // Limit error output
              },
              { status: 500 }
            )
          );
        }
      });

      child.on("error", (error) => {
        console.error("❌ Failed to start script:", error);
        resolve(
          NextResponse.json(
            {
              success: false,
              error: "Failed to start script",
              details: error.message
            },
            { status: 500 }
          )
        );
      });
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

// GET method for health check
export async function GET() {
  return NextResponse.json({
    status: "ready",
    timestamp: new Date().toISOString()
  });
}
