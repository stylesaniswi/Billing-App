import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: params.categoryId,
      },
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
    });

    if (!category) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user?.role ?? '')) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, parentId } = body;

    const currentCategory = await prisma.category.findUnique({
      where: { id: params.categoryId },
      include: { children: true },
    });

    if (!currentCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Check for circular reference
    if (parentId) {
      const newParent = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!newParent) {
        return new NextResponse("Parent category not found", { status: 404 });
      }

      if (newParent.path.startsWith(currentCategory.path)) {
        return new NextResponse("Cannot set a child category as parent", { status: 400 });
      }
    }

    let level = 0;
    let path = name;

    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
        select: { level: true, path: true },
      });

      if (parent) {
        level = parent.level + 1;
        path = parent.path ? `${parent.path}/${name}` : name;
      }
    }

    const category = await prisma.category.update({
      where: {
        id: params.categoryId,
      },
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
        children: true,
        _count: {
          select: {
            children: true,
            items: true,
          },
        },
      },
    });

    // Update paths of all children
    if (currentCategory.path !== path) {
      await updateChildrenPaths(category);
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "ACCOUNTANT"].includes(session.user.role ?? '')) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: { id: params.categoryId },
      include: { children: true },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    if (category.children.length > 0) {
      return new NextResponse(
        "Cannot delete category with subcategories. Delete subcategories first.",
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

async function updateChildrenPaths(category: any) {
  const children = await prisma.category.findMany({
    where: { parentId: category.id },
  });

  for (const child of children) {
    const newPath = `${category.path}/${child.name}`;
    const newLevel = category.level + 1;

    await prisma.category.update({
      where: { id: child.id },
      data: { path: newPath, level: newLevel },
    });

    await updateChildrenPaths({
      ...child,
      path: newPath,
      level: newLevel,
    });
  }
}