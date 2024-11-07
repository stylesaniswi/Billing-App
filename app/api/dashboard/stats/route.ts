import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [totalRevenue, activeCustomers, pendingInvoices, activeSubscriptions] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          invoices: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),
      prisma.invoice.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
        },
      }),
    ]);

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      activeCustomers,
      pendingInvoices,
      activeSubscriptions,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}