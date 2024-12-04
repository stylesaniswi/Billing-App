"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form";
import { useToast } from "@/hooks/use-toast";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.invoiceId}`);
        if (!response.ok) throw new Error("Failed to fetch invoice");
        const data = await response.json();
        setInvoiceData(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load invoice details",
        });
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [params.invoiceId, toast, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Edit Invoice</h1>
      <CreateInvoiceForm
        initialData={invoiceData}
      />
    </div>
  );
}
