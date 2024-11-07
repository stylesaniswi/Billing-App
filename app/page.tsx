import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-4xl font-bold">Modern Billing System</h1>
      <p className="text-lg text-muted-foreground">
        Manage your invoices, payments, and subscriptions with ease
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}