import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

const tableVariants = {
  variant: {
    default: "",
    striped: "[&_tbody_tr:nth-child(odd)]:bg-muted/50",
    bordered:
      "border-collapse border border-border [&_th]:border [&_th]:border-border [&_td]:border [&_td]:border-border",
  },
  size: {
    sm: "text-xs [&_th]:px-2 [&_th]:py-1.5 [&_td]:px-2 [&_td]:py-1.5",
    md: "text-sm [&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3",
  },
} as const;

interface TableProps extends ComponentProps<"table"> {
  variant?: keyof typeof tableVariants.variant;
  tableSize?: keyof typeof tableVariants.size;
  stickyHeader?: boolean;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      variant = "default",
      tableSize = "md",
      stickyHeader = false,
      ...props
    },
    ref,
  ) => (
    <div className="relative w-full overflow-auto rounded-md border border-border">
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom",
          tableVariants.variant[variant],
          tableVariants.size[tableSize],
          stickyHeader &&
            "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:bg-muted",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  ComponentProps<"thead">
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<
  HTMLTableSectionElement,
  ComponentProps<"tbody">
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  ComponentProps<"tfoot">
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = forwardRef<HTMLTableRowElement, ComponentProps<"tr">>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = forwardRef<HTMLTableCellElement, ComponentProps<"th">>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = forwardRef<HTMLTableCellElement, ComponentProps<"td">>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return (
    <caption
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  tableVariants,
};
export type { TableProps };
