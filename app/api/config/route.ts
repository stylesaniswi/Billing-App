import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ConfigType } from "@prisma/client";

export async function GET() {
  try {
    const configs = await prisma.config.findMany();
    return NextResponse.json(configs);
  } catch (error) {
    console.error("[CONFIG_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { key, value, type, description } = body;

    const config = await prisma.config.create({
      data: {
        key,
        value: type === ConfigType.JSON ? JSON.stringify(value) : String(value),
        type,
        description,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("[CONFIG_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}