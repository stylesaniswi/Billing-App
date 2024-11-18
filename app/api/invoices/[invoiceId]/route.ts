import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[INVOICE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}