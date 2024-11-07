import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [totalRevenue, totalUsers, activeInvoices] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.user.count(),
      prisma.invoice.count({
        where: {
          status: {
            in: ["PENDING", "OVERDUE"],
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalUsers,
      activeInvoices,
      growthRate: 15.7, // Calculate this based on historical data
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}