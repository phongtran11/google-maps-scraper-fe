import type { ComponentProps } from "react";

import { forwardRef } from "react";

import { cn } from "~/shared/utils";

const tableVariants = {
  size: {
    md: "text-sm [&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3",
    sm: "text-xs [&_th]:px-2 [&_th]:py-1.5 [&_td]:px-2 [&_td]:py-1.5",
  },
  variant: {
    bordered:
      "border-collapse border border-border [&_th]:border [&_th]:border-border [&_td]:border [&_td]:border-border",
    default: "",
    striped: "[&_tbody_tr:nth-child(odd)]:bg-muted/50",
  },
} as const;

interface TableProps extends ComponentProps<"table"> {
  stickyHeader?: boolean;
  tableSize?: keyof typeof tableVariants.size;
  variant?: keyof typeof tableVariants.variant;
  wrapperClassName?: string;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      stickyHeader = false,
      tableSize = "md",
      variant = "default",
      wrapperClassName,
      ...props
    },
    ref,
  ) => (
    <div
      className={cn(
        "border-border relative max-h-[600px] w-full overflow-auto overflow-y-auto rounded-md border md:max-h-[calc(100vh-320px)]",
        wrapperClassName,
      )}
    >
      <table
        className={cn(
          "w-full caption-bottom",
          tableVariants.variant[variant],
          tableVariants.size[tableSize],
          stickyHeader &&
            "[&_thead_th]:bg-muted [&_thead_th]:border-border [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:border-b",
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = forwardRef<HTMLTableSectionElement, ComponentProps<"thead">>(
  ({ className, ...props }, ref) => (
    <thead className={cn("[&_tr]:border-b", className)} ref={ref} {...props} />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<HTMLTableSectionElement, ComponentProps<"tbody">>(
  ({ className, ...props }, ref) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} ref={ref} {...props} />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = forwardRef<HTMLTableSectionElement, ComponentProps<"tfoot">>(
  ({ className, ...props }, ref) => (
    <tfoot
      className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)}
      ref={ref}
      {...props}
    />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = forwardRef<HTMLTableRowElement, ComponentProps<"tr">>(
  ({ className, ...props }, ref) => (
    <tr
      className={cn(
        "border-border hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = forwardRef<HTMLTableCellElement, ComponentProps<"th">>(
  ({ className, ...props }, ref) => (
    <th
      className={cn(
        "text-muted-foreground h-12 text-left align-middle font-medium has-[[role=checkbox]]:pr-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = forwardRef<HTMLTableCellElement, ComponentProps<"td">>(
  ({ className, ...props }, ref) => (
    <td className={cn("align-middle has-[[role=checkbox]]:pr-0", className)} ref={ref} {...props} />
  ),
);
TableCell.displayName = "TableCell";

function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return <caption className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />;
}
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  tableVariants,
};
export type { TableProps };
