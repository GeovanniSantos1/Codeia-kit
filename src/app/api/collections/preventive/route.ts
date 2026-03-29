import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserFromClerkId } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { withApiLogging } from "@/lib/logging/api";
import { decimalToNumber } from "@/lib/loans/calculations";

async function handleGetPreventive() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserFromClerkId(clerkId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 8);

    const installments = await db.installment.findMany({
      where: {
        loan: { userId: user.id, status: "ACTIVE" },
        status: "PENDING",
        dueDate: { gte: today, lt: in7Days },
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
      const dueDate = new Date(inst.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffMs = dueDate.getTime() - today.getTime();
      const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let group: "1D" | "3D" | "7D";
      if (daysUntilDue <= 1) group = "1D";
      else if (daysUntilDue <= 3) group = "3D";
      else group = "7D";

      const lastLog = inst.notificationLogs[0] ?? null;

      return {
        id: inst.id,
        number: inst.number,
        dueDate: inst.dueDate.toISOString(),
        amount: decimalToNumber(inst.amount),
        daysUntilDue,
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
      "1D": mapped.filter((i) => i.group === "1D"),
      "3D": mapped.filter((i) => i.group === "3D"),
      "7D": mapped.filter((i) => i.group === "7D"),
    };

    return NextResponse.json({ data: groups, total: mapped.length });
  } catch (error) {
    console.error("[Collections/Preventive API] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withApiLogging(handleGetPreventive, {
  method: "GET",
  route: "/api/collections/preventive",
  feature: "collections",
});
