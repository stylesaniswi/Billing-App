"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  number: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
}

export function RecentInvoices() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentInvoices = async () => {
      try {
        const response = await fetch("/api/dashboard/recent-invoices");
        if (!response.ok) throw new Error("Failed to fetch recent invoices");
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load recent invoices",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentInvoices();
  }, [toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {invoice.customer.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {invoice.customer.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.customer.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm font-medium">{formatCurrency(invoice.total)}</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  invoice.status === "PAID"
                    ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-500"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-500"
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}