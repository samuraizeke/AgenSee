"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "./table";
import { cn } from "@/lib/utils";

export type SortOrder = "asc" | "desc" | null;

interface SortableTableHeadProps {
  column: string;
  label: string;
  currentSort: string | null;
  currentOrder: SortOrder;
  onSort: (column: string, order: SortOrder) => void;
  className?: string;
}

export function SortableTableHead({
  column,
  label,
  currentSort,
  currentOrder,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = currentSort === column;

  const handleClick = () => {
    if (!isActive) {
      // First click on this column: sort ascending
      onSort(column, "asc");
    } else if (currentOrder === "asc") {
      // Second click: sort descending
      onSort(column, "desc");
    } else {
      // Third click: clear sort
      onSort(column, null);
    }
  };

  return (
    <TableHead className={cn("px-4", className)}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 text-left font-medium transition-colors hover:text-foreground"
      >
        {label}
        {isActive && currentOrder === "asc" && (
          <ArrowUp className="h-4 w-4 text-primary" />
        )}
        {isActive && currentOrder === "desc" && (
          <ArrowDown className="h-4 w-4 text-primary" />
        )}
        {!isActive && (
          <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
        )}
      </button>
    </TableHead>
  );
}
