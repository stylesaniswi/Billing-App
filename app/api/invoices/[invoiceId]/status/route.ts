import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const invoice = await prisma.invoice.update({
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
      data: {
        status,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[INVOICE_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}