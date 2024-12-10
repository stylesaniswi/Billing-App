'use client';

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-bold">Modern Billing System</h1>
      <p className="text-lg text-muted-foreground">
        Manage your invoices, payments, and subscriptions with ease
      </p>
      {session?.user == null ? 
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      : 
        <div>
          You are Logged in.
          <br />
          <Button className="m-4" asChild>
            <Link href="/dashboard">Go to Home Page.</Link>
          </Button>
        </div>
      }
    </div>
  );
}
