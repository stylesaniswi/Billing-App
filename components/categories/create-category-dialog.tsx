'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  level: number;
}

interface CreateCategoryDialogProps {
  open: boolean;
  parentCategory: Category | null;
  categories: Category[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (category: any) => void;
}

export function CreateCategoryDialog({
  open,
  parentCategory,
  categories,
  onOpenChange,
  onSuccess,
}: CreateCategoryDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const categoryData = {
      name: formData.get('name'),
      description: formData.get('description'),
      color: formData.get('color'),
      parentId: parentCategory?.id || formData.get('parentId') || null,
    };

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const category = await response.json();
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      onSuccess(category);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create category',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableParentCategories = categories?.filter(
    (category) => category.level < 2 && category.id !== parentCategory?.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentCategory
              ? `Create Subcategory under ${parentCategory.name}`
              : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {parentCategory
              ? 'Add a new subcategory to the selected parent category.'
              : 'Add a new top-level category or select a parent category.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>

          {!parentCategory && availableParentCategories?.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category (Optional)</Label>
              <Select name="parentId">
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  {availableParentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input id="color" name="color" type="color" className="h-10 px-2" />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
