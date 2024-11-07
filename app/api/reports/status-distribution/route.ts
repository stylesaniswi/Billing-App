import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const distribution = await prisma.invoice.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      _count: true,
    });

    const data = distribution.map(item => ({
      status: item.status,
      count: item._count,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[STATUS_DISTRIBUTION_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}