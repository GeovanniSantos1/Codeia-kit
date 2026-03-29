import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { withApiLogging } from "@/lib/logging/api";

const VALID_TYPES = [
  "PREVENTIVE_7D",
  "PREVENTIVE_3D",
  "PREVENTIVE_1D",
  "REACTIVE_1_3D",
  "REACTIVE_4_7D",
  "REACTIVE_8D_PLUS",
] as const;

async function handlePostLog(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);
    const body = await request.json();
    const { installmentId, type } = body;

    if (!installmentId || !type) {
      return NextResponse.json(
        { error: "installmentId and type are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    const installment = await db.installment.findFirst({
      where: { id: installmentId, loan: { userId: user.id } },
    });

    if (!installment) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 });
    }

    const log = await db.notificationLog.create({
      data: {
        userId: user.id,
        installmentId,
        type,
        channel: "WHATSAPP",
      },
    });

    return NextResponse.json({ data: log });
  } catch (error) {
    console.error("[Collections/Log API] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withApiLogging(handlePostLog, {
  method: "POST",
  route: "/api/collections/log",
  feature: "collections",
});
