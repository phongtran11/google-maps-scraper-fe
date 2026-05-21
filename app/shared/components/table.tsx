import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import { Pagination, type PaginationProps } from "./pagination";

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
  wrapperClassName?: string;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      variant = "default",
      tableSize = "md",
      stickyHeader = false,
      wrapperClassName,
      ...props
    },
    ref,
  ) => (
    <div className={cn("relative w-full overflow-auto rounded-md border border-border max-h-[600px] md:max-h-[calc(100vh-320px)] overflow-y-auto", wrapperClassName)}>
      <table
        ref={ref}
        className={cn(
          "w-full caption-bottom",
          tableVariants.variant[variant],
          tableVariants.size[tableSize],
          stickyHeader &&
            "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:bg-muted [&_thead_th]:z-10 [&_thead_th]:border-b [&_thead_th]:border-border",
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

// ---- DataTable composite component ----

interface DataTableColumn<T> {
  id?: string;
  header: string;
  accessor?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  cellClassName?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  pagination?: PaginationProps;
  variant?: keyof typeof tableVariants.variant;
  tableSize?: keyof typeof tableVariants.size;
  stickyHeader?: boolean;
  className?: string;
  wrapperClassName?: string;
}

function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage,
  emptyState,
  pagination,
  variant = "default",
  tableSize = "md",
  stickyHeader = false,
  className,
  wrapperClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn("space-y-0", className)}>
      <Table variant={variant} tableSize={tableSize} stickyHeader={stickyHeader} wrapperClassName={wrapperClassName}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.id ?? col.header}
                className={cn(
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.className ?? col.headerClassName,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`}>
                {columns.map((col, colIdx) => (
                  <TableCell
                    key={col.id ?? col.header}
                    className={col.cellClassName}
                  >
                    <div
                      className={cn(
                        "h-4 animate-pulse rounded bg-muted",
                        colIdx % 2 === 0 ? "w-full" : "w-3/4",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
            : data.length === 0
              ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyState ?? (
                      <span className="text-muted-foreground">
                        {emptyMessage ?? "Không có dữ liệu"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
              : data.map((item, index) => (
                <TableRow key={keyExtractor(item)}>
                  {columns.map((col) => {
                    const cellKey = col.id ?? col.header;
                    const cellValue = col.cell
                      ? col.cell(item, index)
                      : col.accessor
                        ? String(item[col.accessor] ?? "")
                        : null;

                    return (
                      <TableCell
                        key={cellKey}
                        className={cn(
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.cellClassName,
                        )}
                      >
                        {cellValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
DataTable.displayName = "DataTable";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
  tableVariants,
};
export type { TableProps, DataTableProps, DataTableColumn };
