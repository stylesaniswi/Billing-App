import ExcelJS from 'exceljs';
import { Invoice, InvoiceItem } from '@prisma/client';

export async function generateExcelWorkbook(invoices: any[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Invoices');

  // Set up headers
  worksheet.columns = [
    { header: 'Invoice Number', key: 'number', width: 15 },
    { header: 'Customer', key: 'customer', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Due Date', key: 'dueDate', width: 15 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
    { header: 'Tax', key: 'tax', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
  ];

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data
  invoices.forEach((invoice) => {
    worksheet.addRow({
      number: invoice.number,
      customer: invoice.customer.name,
      status: invoice.status,
      date: new Date(invoice.createdAt).toLocaleDateString(),
      dueDate: new Date(invoice.dueDate).toLocaleDateString(),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
    });
  });

  // Add items worksheet
  const itemsWorksheet = workbook.addWorksheet('Invoice Items');
  itemsWorksheet.columns = [
    { header: 'Invoice Number', key: 'invoiceNumber', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Category', key: 'category', width: 15 },
  ];

  itemsWorksheet.getRow(1).font = { bold: true };
  itemsWorksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  invoices.forEach((invoice) => {
    invoice.items.forEach((item: any) => {
      itemsWorksheet.addRow({
        invoiceNumber: invoice.number,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        category: item.category?.name || 'N/A',
      });
    });
  });

  return workbook;
}