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
    const { customerId, dueDate, items, prePayment, notes, noteImages } = body;

    const itemsTotal = items.reduce((acc:number, item:any) =>
      acc + (parseInt(item.quantity) * parseFloat(item.unitPrice)), 0);
    
    const tax = itemsTotal * 0.1;
    const subtotal = itemsTotal;
    const total = itemsTotal * 1.1 - prePayment;
    if (prePayment > itemsTotal) {
      throw new Error("Prepayment cannot exceed the total item cost.");
    }
    
    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${Date.now()}`,
        createdById: session.user.id,
        customerId,
        dueDate: new Date(dueDate),
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            itemId: item.itemId,
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseInt(item.quantity) * parseFloat(item.unitPrice),
          })),
        },
        notes : notes,
        noteImages :{
          create: noteImages.map((noteImage: any)=>({
            url: noteImage.url,

          }))
        },
        prePayment,
        subtotal,
        total,
        tax
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