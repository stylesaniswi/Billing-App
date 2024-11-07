'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InvoiceList } from '@/components/invoices/invoice-list';
import { CreateInvoiceButton } from '@/components/invoices/create-invoice-button';
import { InvoiceFilters } from '@/components/invoices/invoice-filters';
import { exportToExcel } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

export default function InvoicesPage() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/invoices/export?status=${filterStatus}&from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`
      );
      if (!response.ok) throw new Error('Export failed');

      const data = await response.blob();
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `invoices-${new Date().toISOString()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to export invoices',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <CreateInvoiceButton />
      </div>
      <InvoiceFilters
        status={filterStatus}
        onStatusChange={setFilterStatus}
        onDateChange={setDateRange}
        onExport={handleExport}
      />
      <InvoiceList status={filterStatus} dateRange={dateRange} />
    </div>
  );
}
