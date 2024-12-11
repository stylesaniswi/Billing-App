interface Item {
    quantity: string | number;
    unitPrice: string | number;
  }
  
  interface Totals {
    itemsTotal: number;
    tax: number;
    subtotal: number;
    total: number;
  }
  
  export const calculateTotals = (
    items: Item[],
    prePayment: number = 0, 
    taxRate: number 
  ): Totals => {
    const itemsTotal = items.reduce(
      (acc: number, item: Item) =>
        acc + parseInt(item.quantity as string) * parseFloat(item.unitPrice as string),
      0
    );
  
    const tax = itemsTotal * (taxRate / 100);
    const subtotal = itemsTotal;
    const total = itemsTotal + tax - prePayment;
  
    return { itemsTotal, tax, subtotal, total };
  };
  