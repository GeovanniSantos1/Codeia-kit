import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { getDashboardCharts } from "@/lib/loans/chart-queries";
import { withApiLogging } from "@/lib/logging/api";

async function handleGetCharts() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const charts = await getDashboardCharts(user.id);

    return NextResponse.json(charts);
  } catch (error) {
    console.error("[Reports/Charts API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleGetCharts, {
  method: "GET",
  route: "/api/reports/charts",
  feature: "reports",
});
