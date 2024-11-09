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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  level: number;
  parentId: string | null;
  parent?: {
    name: string;
  };
  children?: Category[];
}

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (item: any) => void;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateItemDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  // Fetch categories when dialog opens
  useState(() => {
    fetch('/api/categories?includeChildren=true')
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name'),
      description: formData.get('description'),
      imageUrl: imageUrl,
      price: formData.get('price'),
      categoryId: formData.get('categoryId'),
    };

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) throw new Error('Failed to create item');

      const item = await response.json();
      toast({
        title: 'Success',
        description: 'Item created successfully',
      });
      onSuccess(item);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create item',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOption = (category: Category, depth: number = 0) => (
    <div key={category.id} style={{ display: 'flex', paddingLeft: `${depth * .5}rem` }}>
      {depth > 0 && <ChevronRight className="h-4 w-4 mr-2" />} {/* Show icon for child categories */}
      <SelectItem value={category.id}>
        {category.name}
      </SelectItem>
      {/* Render children categories recursively */}
      {category.children?.map((child) => renderCategoryOption(child, depth + 1))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <FileUpload value={imageUrl} onUpload={setImageUrl} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => renderCategoryOption(category, 0))}
              </SelectContent>
            </Select>
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
              {loading ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
