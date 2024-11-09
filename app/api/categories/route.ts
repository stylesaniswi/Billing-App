import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const MAX_DEPTH = parseInt(process.env.CATEGORY_DEPTH || "3", 10); // Fetch depth from env, default to 3

// Recursive function to fetch categories up to a certain depth
async function fetchCategories(parentId: string | null, depth: number) {
  if (depth < 0) return []; // Stop if depth is less than 0

  const categories = await prisma.category.findMany({
    where: {
      parentId: parentId || null,
    },
    include: {
      children: depth > 0 // Only include children if depth allows
        ? {
            include: {
              parent: true,
              children: true,
              _count: {
                select: {
                  children: true,
                  items: true,
                },
              },
            },
          }
        : false,
      parent: true,
      _count: {
        select: {
          children: true,
          items: true,
        },
      },
    },
    orderBy: [
      { level: "asc" },
      { name: "asc" },
    ],
  });

  // Recursively fetch children for each category
  for (const category of categories) {
    category.children = await fetchCategories(category.id, depth - 1);
  }

  return categories;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const includeChildren = searchParams.get("includeChildren") === "true";

    const categories = await fetchCategories(parentId, MAX_DEPTH); // Fetch categories with depth

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, parentId } = body;

    let level = 0;
    let path = "";

    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
        select: { level: true, path: true },
      });

      if (!parent) {
        return new NextResponse("Parent category not found", { status: 404 });
      }

      // Check if the parent category's level is at the maximum depth
      if (parent.level >= MAX_DEPTH) {
        return new NextResponse(`Cannot create subcategory. Maximum depth of ${MAX_DEPTH} reached.`, { status: 400 });
      }

      level = parent.level + 1;
      path = parent.path ? `${parent.path}/${name}` : name;
    } else {
      path = name;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color,
        parentId,
        level,
        path,
      },
      include: {
        parent: true,
        _count: {
          select: {
            children: true,
            items: true,
          },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}