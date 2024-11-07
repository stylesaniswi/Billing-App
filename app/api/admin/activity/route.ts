import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        start: startOfDay(date),
        label: format(date, "MMM dd"),
      };
    }).reverse();

    const activityData = await Promise.all(
      days.map(async ({ start, label }) => {
        const [newUsers, activeUsers] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: start,
                lt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
              },
            },
          }),
          prisma.user.count({
            where: {
              invoices: {
                some: {
                  createdAt: {
                    gte: start,
                    lt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
                  },
                },
              },
            },
          }),
        ]);

        return {
          date: label,
          newUsers,
          activeUsers,
        };
      })
    );

    return NextResponse.json(activityData);
  } catch (error) {
    console.error("[ADMIN_ACTIVITY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}