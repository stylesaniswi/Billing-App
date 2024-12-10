'use client';

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
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { EditItemDialog } from './edit-item-dialog';
import { useState } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

export interface Item {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  category: {
    name: string;
  } | null;
}

interface ItemListProps {
  items: Item[];
  onItemUpdated: (item: Item) => void;
  onItemDeleted: (id: string) => void;
}

export function ItemList({
  items,
  onItemUpdated,
  onItemDeleted,
}: ItemListProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const canManageItems =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'ACCOUNTANT';

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      onItemDeleted(id);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete item',
      });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              {canManageItems && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-[50px] h-[50px] bg-muted rounded-md flex items-center justify-center">
                      No image
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description || '-'}</TableCell>
                <TableCell>{formatCurrency(item.price)}</TableCell>
                <TableCell>{item.category?.name || '-'}</TableCell>
                {canManageItems && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingItem(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditItemDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSuccess={(updatedItem) => {
          onItemUpdated(updatedItem);
          setEditingItem(null);
        }}
      />
    </>
  );
}
