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

    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      where: session.user.role === "CUSTOMER" 
        ? { customerId: session.user.id }
        : undefined,
    });

    return NextResponse.json(recentInvoices);
  } catch (error) {
    console.error("[RECENT_INVOICES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}