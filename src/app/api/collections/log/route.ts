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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(installment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const isPreventive = type.startsWith("PREVENTIVE_");
    const isReactive = type.startsWith("REACTIVE_");

    if (isPreventive && diffDays < 0) {
      return NextResponse.json(
        { error: "Cannot use preventive type for an overdue installment" },
        { status: 400 }
      );
    }
    if (isReactive && diffDays >= 0) {
      return NextResponse.json(
        { error: "Cannot use reactive type for a non-overdue installment" },
        { status: 400 }
      );
    }
    if (type === "PREVENTIVE_1D" && (diffDays < 0 || diffDays > 1)) {
      return NextResponse.json(
        { error: "Type PREVENTIVE_1D requires installment due in 0–1 days" },
        { status: 400 }
      );
    }
    if (type === "PREVENTIVE_3D" && (diffDays < 2 || diffDays > 3)) {
      return NextResponse.json(
        { error: "Type PREVENTIVE_3D requires installment due in 2–3 days" },
        { status: 400 }
      );
    }
    if (type === "PREVENTIVE_7D" && (diffDays < 6 || diffDays > 7)) {
      return NextResponse.json(
        { error: "Type PREVENTIVE_7D requires installment due in 6–7 days" },
        { status: 400 }
      );
    }
    if (type === "REACTIVE_1_3D" && (diffDays > -1 || diffDays < -3)) {
      return NextResponse.json(
        { error: "Type REACTIVE_1_3D requires installment 1–3 days overdue" },
        { status: 400 }
      );
    }
    if (type === "REACTIVE_4_7D" && (diffDays > -4 || diffDays < -7)) {
      return NextResponse.json(
        { error: "Type REACTIVE_4_7D requires installment 4–7 days overdue" },
        { status: 400 }
      );
    }
    if (type === "REACTIVE_8D_PLUS" && diffDays > -8) {
      return NextResponse.json(
        { error: "Type REACTIVE_8D_PLUS requires installment 8+ days overdue" },
        { status: 400 }
      );
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
