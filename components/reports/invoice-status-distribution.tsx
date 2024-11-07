"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface StatusData {
  status: string;
  count: number;
}

interface InvoiceStatusDistributionProps {
  dateRange: {
    from: Date;
    to: Date;
  };
}

export function InvoiceStatusDistribution({ dateRange }: InvoiceStatusDistributionProps) {
  const { toast } = useToast();
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/reports/status-distribution?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setData(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load status distribution data",
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
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
}