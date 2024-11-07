"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ItemList } from "@/components/items/item-list";
import { CreateItemDialog } from "@/components/items/create-item-dialog";

export default function ItemsPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/items");
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();
        setItems(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load items",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Items</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Item
        </Button>
      </div>

      <ItemList
        items={items}
        onItemUpdated={(updatedItem) => {
          setItems(items.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          ));
        }}
        onItemDeleted={(deletedId) => {
          setItems(items.filter(item => item.id !== deletedId));
        }}
      />

      <CreateItemDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={(newItem) => {
          setItems([...items, newItem]);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}