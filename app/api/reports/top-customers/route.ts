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

    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        receivedInvoices: {
          some: {
            createdAt: {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        receivedInvoices: {
          where: {
            status: "PAID",
            createdAt: {
              gte: from ? new Date(from) : undefined,
              lte: to ? new Date(to) : undefined,
            },
          },
          select: {
            total: true,
          },
        },
        _count: {
          select: {
            receivedInvoices: true,
          },
        },
      },
    });

    const data = customers
      .map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalSpent: customer.receivedInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
        invoiceCount: customer._count.receivedInvoices,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[TOP_CUSTOMERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}