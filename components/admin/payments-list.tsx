'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface Payment {
  id: string;
  amount: number;
  status: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export function PaymentsList() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/admin/payments');
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data = await response.json();
        setPayments(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load payments',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{payment.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{payment.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {payment.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge
                variant={
                  payment.status === 'COMPLETED'
                    ? 'success'
                    : payment.status === 'PENDING'
                    ? 'warning'
                    : 'destructive'
                }
              >
                {payment.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
