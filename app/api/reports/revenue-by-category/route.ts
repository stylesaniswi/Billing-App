import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role ?? '')) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const revenueByCategory = await prisma.invoiceItem.groupBy({
      by: ['categoryId'],
      where: {
        invoice: {
          createdAt: {
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(to) : undefined,
          },
          status: "PAID",
        },
      },
      _sum: {
        total: true,
      },
    });

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: revenueByCategory.map(item => item.categoryId).filter(Boolean) as string[],
        },
      },
    });

    const data = revenueByCategory.map(item => ({
      name: categories.find(cat => cat.id === item.categoryId)?.name || "Uncategorized",
      value: item._sum.total || 0,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[REVENUE_BY_CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}