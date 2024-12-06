"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import Image from "next/image";
import { X } from "lucide-react";

interface InvoiceItem {
  itemId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  categoryId: string | null;
  imageUrl?: string;
}

interface Item {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  name: string;
}

interface NoteImage{
  url:string;
}

export function CreateInvoiceForm({ initialData }: any) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || [
    { itemId: null, description: "", quantity: 1, price: 0, categoryId: null, imageUrl: "" }
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productItems, setProductItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteImages, setNoteImages] = useState<NoteImage[]>(initialData?.noteImages ||[]);
  const [dueDate, setDueDate] = useState(initialData ? new Date(initialData.dueDate).toISOString().split("T")[0] : '');
  const [invoiceNote,setInvoiceNote] = useState(initialData? initialData.notes : '')
  const [customerId , setCustomerId] = useState(initialData.customerId || '')

  useEffect(() => {
    if (initialData) {
      setItems(initialData.items || []);
      setNoteImages(initialData.noteImages || []);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, customersRes, itemsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/users?role=CUSTOMER"),
          fetch("/api/items")
        ]);

        if (!categoriesRes.ok || !customersRes.ok || !itemsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [categoriesData, customersData, itemsData] = await Promise.all([
          categoriesRes.json(),
          customersRes.json(),
          itemsRes.json()
        ]);

        setCategories(categoriesData);
        setCustomers(customersData);
        setProductItems(itemsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load form data",
        });
      }
    };

    fetchData();
  }, [toast]);

  const addItem = () => {
    setItems([...items, { itemId: null, description: "", quantity: 1, unitPrice: 0, categoryId: null, imageUrl: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'itemId' && typeof value === 'string') {
      const selectedItem = productItems.find(item => item.id === value);
      if (selectedItem) {
        newItems[index] = {
          ...newItems[index],
          itemId: value,
          description: selectedItem.description || selectedItem.name,
          unitPrice: selectedItem.price,
          categoryId: selectedItem.categoryId,
          imageUrl: selectedItem.imageUrl || "",
        };
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
    }
    setItems(newItems);
  };

  const updateItemImage = (index: number, url: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      imageUrl: url,
    };
    setItems(newItems);
  };

  const addNoteImage = ( url: string) => {
    const newNoteImages = [...noteImages];
    const index = noteImages.length
    newNoteImages[index]={
      ...newNoteImages[index],
      url: url
    }
    setNoteImages(newNoteImages);
  };

  const removeNoteImage = (index: number) => {
    setNoteImages(noteImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const updatedInvoice = {
      customerId: customerId ? customerId : formData.get("customer"),
      dueDate: formData.get("dueDate"),
      items: items.map((item) => ({
        itemId: item.itemId,
        description: item.description,
        unitPrice: parseFloat(String(item.unitPrice)),
        quantity: parseInt(String(item.quantity)),
        categoryId: item.categoryId,
        imageUrl: item.imageUrl,
      })),
      notes: formData.get("notes"),
      status:initialData? initialData.status :"PENDING",
      noteImages: noteImages,
    };
    const invoiceID = initialData ? initialData.id : null;
  
    try {
      const method = invoiceID ? "PATCH" : "POST"; // Dynamic HTTP method
      const endpoint = invoiceID ? `/api/invoices/${invoiceID}` : "/api/invoices"; // Dynamic endpoint
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInvoice),
      });
  
      if (!response.ok) {
        throw new Error(invoiceID ? "Failed to update invoice" : "Failed to create invoice");
      }
  
      const invoice = await response.json();
  
      toast({
        title: "Success",
        description: invoiceID ? "Invoice updated successfully" : "Invoice created successfully",
      });
  
      router.push(`/dashboard/invoices/${invoice.id}`);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: invoiceID ? "Failed to update invoice" : "Failed to create invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            {initialData?
            <p className="text-lg font-bold">{initialData.customer.name}</p>
          :
          <Select name="customer" required>
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
            
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} id="dueDate" name="dueDate" required />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Items</Label>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-3">
                <Select
                  value={item.itemId || undefined}
                  onValueChange={(value) => updateItem(index, "itemId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {productItems.map((productItem) => (
                      <SelectItem key={productItem.id} value={productItem.id}>
                        <div className="flex items-center gap-2">
                          {productItem.imageUrl && (
                            <Image
                              src={productItem.imageUrl}
                              alt={productItem.name}
                              width={20}
                              height={20}
                              className="rounded-sm"
                            />
                          )}
                          {productItem.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="col-span-1">
                <FileUpload
                  value={item.imageUrl}
                  onUpload={(url) => updateItemImage(index, url)}
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={initialData?items.length === 0:items.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addItem}>
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" value={invoiceNote} onChange={(e) => setInvoiceNote(e.target.value)} placeholder="Additional notes..." />
          <div className="mt-2">
            <Label>Note Images</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {noteImages.map((noteImage, index) => (
                <div key={index} className="relative">
                  <Image
                    src={noteImage.url}
                    alt={`Note image ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => removeNoteImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <FileUpload
                onUpload={addNoteImage}
                className="aspect-square"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
        {loading ? "Processing..." : initialData ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}