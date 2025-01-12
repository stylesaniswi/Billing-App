import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { calculateTotals, updateStatus } from "@/app/utils/calculateTotals";

export async function GET(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: params.invoiceId,
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            profile: true,
          },
        },
        items: {
          select:{
            itemId      :true,
            item       :true,
            description :true,
            quantity    :true,
            unitPrice   :true,
            total       :true
          }
        },
        noteImages:{
          select:{
            url : true
          }
        },    
        payments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (invoice.createdById !== session.user.id && invoice.customerId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const transformedInvoice = {
      ...invoice,
      items: invoice.items.map((item) => ({
        itemId: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        item: item.item,
        name: item.item?.name || null, // Include item name
        imageUrl: item.item?.imageUrl || null, // Flatten imageUrl
      })),
    };

    return NextResponse.json(transformedInvoice);
  } catch (error) {
    console.error("[INVOICE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { invoiceId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.log("Params:", params)
    const { invoiceId } = params;
   
    if (!invoiceId) {
      return new NextResponse("Invoice ID is required", { status: 400 });
    }

    const body = await request.json();
    const { customerId, dueDate, items,prePayment, notes, noteImages, status } = body;

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: params.invoiceId },
    });

    if (!existingInvoice) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    const taxRate = await prisma.config.findUnique({
      where: {
        key: 'tax_rate',
      },
    });

    let taxRateValue = taxRate == null ? 10 : Number(taxRate.value);

    const {itemsTotal,tax,subtotal,subtotalWithGst,total} = calculateTotals(items,prePayment,taxRateValue)
    
    if (prePayment > subtotalWithGst) {
      return new NextResponse("Prepayment cannot exceed the total item cost.", { status: 404 });
    }

    const updated_status = updateStatus(prePayment,subtotalWithGst,status)
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.invoiceId },
      data: {
        customerId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: updated_status,
        notes,
        items: {
          deleteMany: {}, // Remove existing items
          create: items.map((item: any) => ({
            itemId: item.itemId,
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseInt(item.quantity) * parseFloat(item.unitPrice),
          })),
        },
        noteImages: {
          deleteMany: {}, // Remove existing noteImages
          create: noteImages.map((noteImage: any) => ({
            url: noteImage.url,
          })),
        },
        prePayment,
        subtotal,
        tax,
        total,
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

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("[INVOICE_UPDATE]: ", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}