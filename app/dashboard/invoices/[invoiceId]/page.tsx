"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface NoteImage{
  id: string,
  url : string,
}

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  imageUrl?: string;
}

interface Invoice {
  id: string;
  number: string;
  customer: {
    name: string;
    email: string;
    profile: {
      businessName: string;
      address: string;
    } | null;
  };
  status: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  prePayment : number;
  total: number;
  notes: string | null;
  noteImages: NoteImage[];
  createdAt: string;
}

interface NoteImage{
  url:string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [invoiceImage, setInvoiceImage] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.invoiceId}`);
        if (!response.ok) throw new Error("Failed to fetch invoice");
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load invoice details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [params.invoiceId, toast]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/${params.invoiceId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const updatedInvoice = await response.json();
      setInvoice(updatedInvoice);
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update invoice status",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }
  
  const handlePreview = async () => {    
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current, { backgroundColor: "#ffffff", scale: 2});
      const image = canvas.toDataURL("image/png");
      setInvoiceImage(image); 
      setDialogOpen(true); 
    }
  };

  const handleDownloadPDF = () => {
    if (!invoiceImage) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (pdfWidth * 297) / 210; 

    pdf.addImage(invoiceImage, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice_${new Date().getTime()}.pdf`);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.number}</h1>
        <div className="flex items-center gap-4">
          <InvoiceActions 
            invoiceId={invoice.id} 
            currentStatus={invoice.status}
            onStatusUpdate={handleStatusUpdate}
          />
          <Button onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}>
            Edit Invoice
          </Button>   

          <Button onClick={handlePreview} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Send Invoice
          </Button>
        </div>
      </div>

      <div ref={invoiceRef} className="container" >
        <div className="grid md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd>{invoice.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd>{invoice.customer.email}</dd>
                </div>
                {invoice.customer.profile && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Business</dt>
                      <dd>{invoice.customer.profile.businessName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                      <dd>{invoice.customer.profile.address}</dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant={
                      invoice.status === "PAID" ? "success" : 
                      invoice.status === "OVERDUE" ? "destructive" : 
                      invoice.status === "CANCELLED" ? "secondary" :
                      "warning"
                    }>
                      {invoice.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Due Date</dt>
                  <dd>{format(new Date(invoice.dueDate), "PPP")}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd>{format(new Date(invoice.createdAt), "PPP")}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                  {item.imageUrl && (
                    <div className="col-span-2">
                      <div className="relative w-20 h-20">
                        <Image
                          src={item.imageUrl}
                          alt={item.description}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                  <div className={`${item.imageUrl ? 'col-span-4' : 'col-span-6'}`}>
                  <p className="font-medium">{item.name}</p>
                    <p className="text-sm">{item.description}</p>
                  </div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.total)}</div>
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax (10%)</span>
                  <span>{formatCurrency(invoice.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pre Payment</span>
                  <span> - {formatCurrency(invoice.prePayment)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {(invoice.notes || invoice.noteImages?.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
                  <p className="whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.noteImages?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {invoice.noteImages.map((noteImage, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={noteImage.url}
                          alt={`Attachment ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>Review the invoice before downloading.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center">
            {invoiceImage ? (
              <img
                src={invoiceImage}
                alt="Invoice Preview"
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <p>Generating preview...</p>
            )}
            <div className="mt-4 flex justify-end gap-4">
              <Button
              variant="destructive"
                onClick={() => setDialogOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </Button>
              <Button
              variant="default"
                onClick={handleDownloadPDF}
                className="btn btn-primary"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}