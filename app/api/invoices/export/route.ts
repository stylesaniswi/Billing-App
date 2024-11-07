import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateExcelWorkbook } from "@/lib/export";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const whereClause: any = {
      OR: [
        { createdById: session.user.id },
        { customerId: session.user.id },
      ],
    };

    if (status && status !== "all") {
      whereClause.status = status.toUpperCase();
    }

    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.gte = new Date(from);
      if (to) whereClause.createdAt.lte = new Date(to);
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            profile: true,
          },
        },
        items: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const workbook = await generateExcelWorkbook(invoices);
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=invoices-${new Date().toISOString()}.xlsx`,
      },
    });
  } catch (error) {
    console.error("[INVOICES_EXPORT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}