import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { startOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        start: startOfMonth(date),
        label: format(date, "MMM yyyy"),
      };
    }).reverse();

    const revenueData = await Promise.all(
      months.map(async ({ start, label }) => {
        const revenue = await prisma.payment.aggregate({
          where: {
            status: "COMPLETED",
            createdAt: {
              gte: start,
              lt: new Date(start.getFullYear(), start.getMonth() + 1, 1),
            },
          },
          _sum: {
            amount: true,
          },
        });

        return {
          date: label,
          revenue: revenue._sum.amount || 0,
        };
      })
    );

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error("[ADMIN_REVENUE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}