import { forwardRef } from 'react';
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface InvoicePDFTemplateProps {
  invoice: Invoice;
}

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

export const InvoicePDFTemplate = forwardRef<HTMLDivElement, InvoicePDFTemplateProps>(
  ({ invoice }, ref) => {
    return (
      <div ref={ref} className="bg-white p-8 space-y-6 pdf-container">
        <style jsx>{`
         .pdf-container {
           font-family: Arial, sans-serif;
           max-width: 1200px;
           margin: 0 auto;
           background-color: white;
           color: #000000;
         }
         .card {
           background-color: white;
           border: 1px solid #E5E7EB;
           border-radius: 8px;
           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
           margin-bottom: 1rem;
         }
         .card-header {
           background-color: #F9FAFB;
           padding: 1.5rem;
           border-bottom: 1px solid #E5E7EB;
         }
         .card-content {
           background-color: white;
           padding: 1.5rem;
         }
         .item-row {
           padding: 1rem 0;
           border-bottom: 1px solid #E5E7EB;
         }
         .item-row:last-child {
           border-bottom: none;
         }
         .text-muted {
           color: #6B7280;
         }
         .totals-section {
           background-color: #F9FAFB;
           padding: 1rem;
           border-radius: 6px;
           margin-top: 1rem;
         }
         .total-row {
           padding: 0.5rem 0;
           display: flex;
           justify-content: space-between;
         }
         .total-row.final {
           border-top: 2px solid #E5E7EB;
           margin-top: 0.5rem;
           padding-top: 1rem;
           font-weight: bold;
         }
         .image-container {
           border: 1px solid #E5E7EB;
           border-radius: 6px;
           overflow: hidden;
         }
       `}</style>

        <h1 className="text-3xl font-bold tracking-tight">Invoice {invoice.number}</h1>

        <div className="grid md:grid-cols-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Customer Details</h2>
            </div>
            <div className="card-content">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd>{invoice.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd>{invoice.customer.email}</dd>
                </div>
                {invoice.customer.profile && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Business</dt>
                      <dd>{invoice.customer.profile.businessName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd>{invoice.customer.profile.address}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Invoice Details</h2>
            </div>
            <div className="card-content">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                      {invoice.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                  <dd>{format(new Date(invoice.dueDate), "PPP")}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd>{format(new Date(invoice.createdAt), "PPP")}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Items</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {invoice.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                  {item.imageUrl && (
                    <div className="col-span-2">
                      <div className="relative w-20 h-20">
                        <img
                          src={item.imageUrl}
                          alt={item.description}
                          className="object-cover rounded-lg"
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                  <div className={`${item.imageUrl ? 'col-span-4' : 'col-span-6'}`}>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.total)}</div>
                </div>
              ))}
              <hr className="my-4 border-t border-gray-200" />
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
                  <span>- {formatCurrency(invoice.prePayment)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.noteImages?.length > 0) && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Additional Information</h2>
            </div>
            <div className="card-content">
              {invoice.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                  <p className="whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.noteImages?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {invoice.noteImages.map((noteImage, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={noteImage.url}
                          alt={`Attachment ${index + 1}`}
                          className="object-cover rounded-lg w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate'; 