import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const item = await prisma.item.findUnique({
      where: {
        id: params.itemId,
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("[ITEM_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, description, imageUrl, price, categoryId } = body;

    const item = await prisma.item.update({
      where: {
        id: params.itemId,
      },
      data: {
        name,
        description,
        imageUrl,
        price: parseFloat(price),
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[ITEM_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.item.delete({
      where: {
        id: params.itemId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ITEM_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}