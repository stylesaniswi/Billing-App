import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const [revenueByCategory, statusDistribution, topCustomers] = await Promise.all([
      prisma.invoiceItem.groupBy({
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
      }),
      prisma.invoice.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(to) : undefined,
          },
        },
        _count: true,
      }),
      prisma.user.findMany({
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
      }),
    ]);

    const workbook = new ExcelJS.Workbook();

    // Revenue by Category Sheet
    const categorySheet = workbook.addWorksheet('Revenue by Category');
    categorySheet.columns = [
      { header: 'Category', key: 'category', width: 30 },
      { header: 'Revenue', key: 'revenue', width: 15 },
    ];
    revenueByCategory.forEach(item => {
      categorySheet.addRow({
        category: item.categoryId || 'Uncategorized',
        revenue: item._sum.total || 0,
      });
    });

    // Status Distribution Sheet
    const statusSheet = workbook.addWorksheet('Invoice Status Distribution');
    statusSheet.columns = [
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Count', key: 'count', width: 15 },
    ];
    statusDistribution.forEach(item => {
      statusSheet.addRow({
        status: item.status,
        count: item._count,
      });
    });

    // Top Customers Sheet
    const customersSheet = workbook.addWorksheet('Top Customers');
    customersSheet.columns = [
      { header: 'Customer', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Total Spent', key: 'totalSpent', width: 15 },
      { header: 'Invoice Count', key: 'invoiceCount', width: 15 },
    ];
    topCustomers.forEach(customer => {
      customersSheet.addRow({
        name: customer.name,
        email: customer.email,
        totalSpent: customer.receivedInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
        invoiceCount: customer._count.receivedInvoices,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=report-${new Date().toISOString()}.xlsx`,
      },
    });
  } catch (error) {
    console.error("[REPORTS_EXPORT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}