interface Item {
    quantity: string | number;
    unitPrice: string | number;
  }
  
  interface Totals {
    itemsTotal: number;
    tax: number;
    subtotal: number;
    subtotalWithGst :number;
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
    const subtotalWithGst = itemsTotal+tax;
    const total = itemsTotal + tax - prePayment;
  
    return { itemsTotal, tax, subtotal,subtotalWithGst, total };
  };
  
  export const updateStatus = (
    prePayment :number =0,
    total : number,
    status? :string
  ) : string =>{
    if (prePayment === total) {
      return "PAID";
    }
    if (status === "PAID" && prePayment !== total) {
      return "PENDING";
    }
    return status ? status : "PENDING";
  }