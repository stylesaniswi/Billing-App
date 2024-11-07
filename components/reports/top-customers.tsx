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
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  invoiceCount: number;
}

interface TopCustomersProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function TopCustomers({ dateRange }: TopCustomersProps) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/reports/top-customers?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load customer data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Total Spent</TableHead>
          <TableHead className="text-right">Invoices</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell className="text-right">{formatCurrency(customer.totalSpent)}</TableCell>
            <TableCell className="text-right">{customer.invoiceCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}