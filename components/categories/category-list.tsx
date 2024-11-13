'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { EditCategoryDialog } from './edit-category-dialog';
import { CreateCategoryDialog } from './create-category-dialog';

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  parentId: string | null;
  level: number;
  children: Category[]
  _count: {
    children: number;
  };
  parent?: {
    name: string;
  };
}

interface CategoryListProps {
  categories: Category[];
  onCategoryUpdated: (category: Category) => void;
  onCategoryDeleted: (id: string) => void;
}

export function CategoryList({
  categories,
  onCategoryUpdated,
  onCategoryDeleted,
}: CategoryListProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [creatingSubcategory, setCreatingSubcategory] =
    useState<Category | null>(null);

  const canManageCategories =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'ACCOUNTANT';

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      onCategoryDeleted(id);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete category',
      });
    }
  };
  const MAX_DEPTH = parseInt(process.env.CATEGORY_DEPTH || "3", 10); // Fetch max depth from env, default to 3

  const renderCategoryRow = (category: Category, depth: number = 0) => {
    if (depth > MAX_DEPTH) return null;

    return (
      <>
        <TableRow key={category.id}>
          <TableCell>
            <div className="flex items-center space-x-2">
              <div
                style={{ marginLeft: `${depth * 1.5}rem` }} // Indent based on depth
                className="flex items-center"
              >
                {category._count.children > 0 && (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                {category.name}
              </div>
            </div>
          </TableCell>
          <TableCell>{category.parent?.name || '-'}</TableCell>
          <TableCell>{category.description || '-'}</TableCell>
          <TableCell>
            {category.color ? (
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.color}
              </div>
            ) : (
              '-'
            )}
          </TableCell>
          {canManageCategories && (
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {category.level < MAX_DEPTH  && (<DropdownMenuItem
                    onClick={() => setCreatingSubcategory(category)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subcategory
                  </DropdownMenuItem>)}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          )}
        </TableRow>
        {/* Render children categories recursively */}
        {category.children?.map((child) => renderCategoryRow(child, depth + 1))}
      </>
    );
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Color</TableHead>
              {canManageCategories && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>{categories.map((category) => renderCategoryRow(category, 0))}</TableBody>
        </Table>
      </div>

      <EditCategoryDialog
        category={editingCategory}
        categories={categories}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onSuccess={(updatedCategory) => {
          onCategoryUpdated(updatedCategory);
          setEditingCategory(null);
        }}
      />

      <CreateCategoryDialog
        open={!!creatingSubcategory}
        parentCategory={creatingSubcategory}
        categories={categories}
        onOpenChange={(open) => !open && setCreatingSubcategory(null)}
        onSuccess={(newCategory) => {
          onCategoryUpdated(newCategory);
          setCreatingSubcategory(null);
        }}
      />
    </>
  );
}
