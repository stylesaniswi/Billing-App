"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Check, Ban, AlertTriangle } from "lucide-react";
import { useSession } from "next-auth/react";

interface InvoiceActionsProps {
  invoiceId: string;
  currentStatus: string;
  onStatusUpdate: (status: string) => void;
}

export function InvoiceActions({ invoiceId, currentStatus, onStatusUpdate }: InvoiceActionsProps) {
  const { data: session } = useSession();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<"mark-paid" | "mark-overdue" | "cancel" | null>(null);

  const canManageInvoices = session?.user?.role === "ADMIN" || session?.user?.role === "ACCOUNTANT";

  const handleStatusChange = (status: string) => {
    onStatusUpdate(status);
    setShowConfirmDialog(false);
  };

  if (!canManageInvoices) return null;

  const dialogContent = {
    "mark-paid": {
      title: "Mark Invoice as Paid",
      description: "Are you sure you want to mark this invoice as paid? This action cannot be undone.",
      action: () => handleStatusChange("PAID"),
    },
    "mark-overdue": {
      title: "Mark Invoice as Overdue",
      description: "Are you sure you want to mark this invoice as overdue? This action cannot be undone.",
      action: () => handleStatusChange("OVERDUE"),
    },
    "cancel": {
      title: "Cancel Invoice",
      description: "Are you sure you want to cancel this invoice? This action cannot be undone.",
      action: () => handleStatusChange("CANCELLED"),
    },
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus !== "PAID" && (
            <DropdownMenuItem
              onClick={() => {
                setActionType("mark-paid");
                setShowConfirmDialog(true);
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark as Paid
            </DropdownMenuItem>
          )}
          {currentStatus !== "OVERDUE" && (
            <DropdownMenuItem
              onClick={() => {
                setActionType("mark-overdue");
                setShowConfirmDialog(true);
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Mark as Overdue
            </DropdownMenuItem>
          )}
          {currentStatus !== "CANCELLED" && (
            <DropdownMenuItem
              onClick={() => {
                setActionType("cancel");
                setShowConfirmDialog(true);
              }}
              className="text-destructive"
            >
              <Ban className="mr-2 h-4 w-4" />
              Cancel Invoice
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType && dialogContent[actionType].title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType && dialogContent[actionType].description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionType && dialogContent[actionType].action()}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}