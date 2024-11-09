'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CategoryList } from '@/components/categories/category-list';
import { CreateCategoryDialog } from '@/components/categories/create-category-dialog';

export default function CategoriesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const canManageCategories =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'ACCOUNTANT';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?includeChildren=true');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load categories',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        {canManageCategories && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        )}
      </div>

      <CategoryList
        categories={categories}
        onCategoryUpdated={(updatedCategory) => {
          setCategories(
            categories.map((cat) =>
              cat.id === updatedCategory.id ? updatedCategory : cat
            )
          );
        }}
        onCategoryDeleted={(deletedId) => {
          setCategories(categories.filter((cat) => cat.id !== deletedId));
        }}
      />

      <CreateCategoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(newCategory) => {
          setCategories([...categories, newCategory]);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}
