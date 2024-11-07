import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ConfigType } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const config = await prisma.config.findUnique({
      where: { key: params.key },
    });

    if (!config) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("[CONFIG_KEY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { value, type } = body;

    const config = await prisma.config.update({
      where: { key: params.key },
      data: {
        value: type === ConfigType.JSON ? JSON.stringify(value) : String(value),
        type,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("[CONFIG_KEY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.config.delete({
      where: { key: params.key },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CONFIG_KEY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}