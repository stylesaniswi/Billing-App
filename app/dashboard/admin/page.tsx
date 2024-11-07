"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStats } from "@/components/admin/admin-stats";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { PaymentsList } from "@/components/admin/payments-list";
import { UserActivityChart } from "@/components/admin/user-activity-chart";

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  if (session?.user?.role !== "ADMIN") {
    return <div>You don't have permission to view this page.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      
      <AdminStats />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActivityChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentsList />
        </CardContent>
      </Card>
    </div>
  );
}