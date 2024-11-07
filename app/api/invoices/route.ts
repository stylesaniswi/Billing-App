import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause = {
      OR: [
        { createdById: session.user.id },
        { customerId: session.user.id },
      ],
      ...(status && status !== "all" ? {
        status: status.toUpperCase() as any
      } : {})
    };

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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[INVOICES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { customerId, dueDate, items, notes } = body;

    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}`,
        createdById: session.user.id,
        customerId,
        dueDate: new Date(dueDate),
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.price),
            total: parseInt(item.quantity) * parseFloat(item.price),
          })),
        },
        notes,
        subtotal: items.reduce((acc: number, item: any) => 
          acc + (parseInt(item.quantity) * parseFloat(item.price)), 0),
        tax: items.reduce((acc: number, item: any) => 
          acc + (parseInt(item.quantity) * parseFloat(item.price)), 0) * 0.1,
        total: items.reduce((acc: number, item: any) => 
          acc + (parseInt(item.quantity) * parseFloat(item.price)), 0) * 1.1,
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            profile: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[INVOICES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}