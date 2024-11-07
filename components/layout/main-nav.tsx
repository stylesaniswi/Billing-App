"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

const baseRoutes = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Invoices",
    href: "/dashboard/invoices",
  },
  {
    label: "Items",
    href: "/dashboard/items",
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
  },
];

const adminRoutes = [
  {
    label: "Admin Dashboard",
    href: "/dashboard/admin",
    roles: ["ADMIN"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    roles: ["ADMIN"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    roles: ["ADMIN"],
  }
];

const accountingRoutes = [
  {
    label: "Reports",
    href: "/dashboard/reports",
    roles: ["ADMIN", "ACCOUNTANT"],
  },
];

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const userRole = session?.user?.role;

  const routes = [
    ...baseRoutes,
    ...(userRole ? adminRoutes.filter(route => route.roles.includes(userRole)) : []),
    ...(userRole ? accountingRoutes.filter(route => route.roles.includes(userRole)) : []),
  ];

  return (
    <div className="mr-4 hidden md:flex">
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "transition-colors hover:text-primary",
              pathname === route.href
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
            <div className="flex flex-col space-y-3">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "px-2 py-1 text-sm transition-colors hover:text-primary",
                    pathname === route.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}