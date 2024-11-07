"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface InvoiceListProps {
  status: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}

interface Invoice {
  id: string;
  number: string;
  customer: {
    name: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

export function InvoiceList({ status, dateRange }: InvoiceListProps) {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const params = new URLSearchParams();
        if (status !== "all") params.append("status", status);
        if (dateRange.from) params.append("from", dateRange.from.toISOString());
        if (dateRange.to) params.append("to", dateRange.to.toISOString());

        const response = await fetch(`/api/invoices?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch invoices");
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load invoices",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [status, dateRange, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.number}</TableCell>
              <TableCell>{invoice.customer.name}</TableCell>
              <TableCell>{formatCurrency(invoice.total)}</TableCell>
              <TableCell>
                <Badge variant={
                  invoice.status === "PAID" ? "success" : 
                  invoice.status === "OVERDUE" ? "destructive" : 
                  "warning"
                }>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(invoice.createdAt), "PP")}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/invoices/${invoice.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}