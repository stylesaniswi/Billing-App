import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");

    const pages = await prisma.page.findMany({
      where: published ? { published: published === "true" } : undefined,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("[PAGES_GET]", error);
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
    const { slug, title, content, published } = body;

    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return new NextResponse("Page with this slug already exists", { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        slug,
        title,
        content,
        published: published ?? false,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("[PAGES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}