"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface InvoiceFiltersProps {
  status: string;
  onStatusChange: (status: string) => void;
  onDateChange: (dates: { from: Date | null; to: Date | null }) => void;
  onExport: () => void;
}

export function InvoiceFilters({ 
  status, 
  onStatusChange,
  onDateChange,
  onExport
}: InvoiceFiltersProps) {
  const [date, setDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex w-full items-center space-x-2 md:w-[300px]">
          <Input
            placeholder="Search invoices..."
            className="h-9"
          />
          <Button size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                "Select date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date.from}
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate || { from: null, to: null });
                onDateChange(selectedDate || { from: null, to: null });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={status === "all" ? "default" : "outline"}
          onClick={() => onStatusChange("all")}
        >
          All
        </Button>
        <Button
          variant={status === "pending" ? "default" : "outline"}
          onClick={() => onStatusChange("pending")}
        >
          Pending
        </Button>
        <Button
          variant={status === "paid" ? "default" : "outline"}
          onClick={() => onStatusChange("paid")}
        >
          Paid
        </Button>
        <Button
          variant={status === "overdue" ? "default" : "outline"}
          onClick={() => onStatusChange("overdue")}
        >
          Overdue
        </Button>
        <Button
          variant="outline"
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}