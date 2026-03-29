import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { withApiLogging } from "@/lib/logging/api";
import { decimalToNumber, calculateDaysOverdue, calculatePenalty } from "@/lib/loans/calculations";

async function handleGetReactive() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const installments = await db.installment.findMany({
      where: {
        loan: { userId: user.id, status: "ACTIVE" },
        status: { in: ["PENDING", "OVERDUE"] },
        dueDate: { lt: today },
      },
      include: {
        loan: { include: { client: true } },
        notificationLogs: {
          orderBy: { sentAt: "desc" },
          take: 6,
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const mapped = installments.map((inst) => {
      const daysOverdue = calculateDaysOverdue(inst.dueDate);
      const penalty = calculatePenalty(
        decimalToNumber(inst.amount),
        decimalToNumber(inst.loan.penaltyPerDay),
        daysOverdue
      );

      let group: "1_3D" | "4_7D" | "8D_PLUS";
      if (daysOverdue <= 3) group = "1_3D";
      else if (daysOverdue <= 7) group = "4_7D";
      else group = "8D_PLUS";

      const lastLog = inst.notificationLogs[0] ?? null;

      return {
        id: inst.id,
        number: inst.number,
        dueDate: inst.dueDate.toISOString(),
        amount: decimalToNumber(inst.amount),
        penalty: Math.round(penalty * 100) / 100,
        daysOverdue,
        group,
        clientId: inst.loan.client.id,
        clientName: inst.loan.client.name,
        clientWhatsapp: inst.loan.client.whatsapp,
        loanId: inst.loanId,
        lastNotification: lastLog
          ? { type: lastLog.type, sentAt: lastLog.sentAt.toISOString() }
          : null,
      };
    });

    const groups = {
      "1_3D": mapped.filter((i) => i.group === "1_3D"),
      "4_7D": mapped.filter((i) => i.group === "4_7D"),
      "8D_PLUS": mapped.filter((i) => i.group === "8D_PLUS"),
    };

    return NextResponse.json({ data: groups, total: mapped.length });
  } catch (error) {
    console.error("[Collections/Reactive API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleGetReactive, {
  method: "GET",
  route: "/api/collections/reactive",
  feature: "collections",
});
