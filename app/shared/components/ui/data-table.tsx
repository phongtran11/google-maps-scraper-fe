import { cn } from "~/shared/utils";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

type DataTableColumn<T> =
  | DataTableColumnWithAccessor<T>
  | DataTableColumnWithAccessorFn<T>
  | DataTableColumnWithCell<T>;

type DataTableColumnBase = {
  align?: "center" | "left" | "right";
  cellClassName?: string;
  header: React.ReactNode;
  headerClassName?: string;
  id: string;
};

type DataTableColumnWithAccessor<T> = DataTableColumnBase & {
  accessor: keyof T;
  accessorFn?: never;
  cell?: never;
};

type DataTableColumnWithAccessorFn<T> = DataTableColumnBase & {
  accessor?: never;
  accessorFn: (item: T) => React.ReactNode;
  cell?: never;
};

type DataTableColumnWithCell<T> = DataTableColumnBase & {
  accessor?: never;
  accessorFn?: never;
  cell: (item: T, index: number) => React.ReactNode;
};

type DataTableEmptyProps<T> = {
  columns: DataTableColumn<T>[];
  message?: string;
  state?: React.ReactNode;
};

type DataTableProps<T> = {
  className?: string;
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  keyExtractor: (item: T) => number | string;
  skeletonRows?: number;
  stickyHeader?: boolean;
  wrapperClassName?: string;
};

type DataTableSkeletonProps<T> = {
  columns: DataTableColumn<T>[];
  rows?: number;
};

function DataTable<T>({
  className,
  columns,
  data,
  emptyMessage,
  emptyState,
  isLoading = false,
  keyExtractor,
  skeletonRows = 20,
  stickyHeader = false,
  wrapperClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn("space-y-0", className)}>
      <Table wrapperClassName={wrapperClassName}>
        <TableHeader
          className={stickyHeader ? "bg-background sticky top-0 z-10 shadow-sm" : undefined}
        >
          <TableRow>
            {columns.map((col) => (
              <TableHead
                className={cn(
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.headerClassName,
                )}
                key={col.id}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <DataTableSkeleton columns={columns} rows={skeletonRows} />
          ) : data.length === 0 ? (
            <DataTableEmpty columns={columns} message={emptyMessage} state={emptyState} />
          ) : (
            <DataTableContent columns={columns} data={data} keyExtractor={keyExtractor} />
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DataTableContent<T>({
  columns,
  data,
  keyExtractor,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: DataTableProps<T>["keyExtractor"];
}) {
  return data.map((item, index) => (
    <TableRow key={keyExtractor(item)}>
      {columns.map((col) => {
        let cellValue: React.ReactNode;

        if ("cell" in col && col.cell) {
          cellValue = col.cell(item, index);
        } else if ("accessorFn" in col && col.accessorFn) {
          cellValue = col.accessorFn(item);
        } else if ("accessor" in col && col.accessor) {
          cellValue = renderCellValue(item[col.accessor]);
        }

        return (
          <TableCell
            className={cn(
              col.align === "center" && "text-center",
              col.align === "right" && "text-right",
              col.cellClassName,
            )}
            key={col.id}
          >
            {cellValue}
          </TableCell>
        );
      })}
    </TableRow>
  ));
}

function DataTableEmpty<T>({ columns, message, state }: DataTableEmptyProps<T>) {
  return (
    <TableRow>
      <TableCell className="h-24 text-center" colSpan={columns.length}>
        {state ?? <span className="text-muted-foreground">{message ?? "Không có dữ liệu"}</span>}
      </TableCell>
    </TableRow>
  );
}

function DataTableSkeleton<T>({ columns, rows = 20 }: DataTableSkeletonProps<T>) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={`skeleton-${rowIdx}`}>
          {columns.map((col) => (
            <TableCell className={col.cellClassName} key={col.id}>
              <div
                className={cn(
                  "bg-muted h-5.5 animate-pulse rounded",
                  col.id.charCodeAt(0) % 2 === 0 ? "w-full" : "w-3/4",
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function renderCellValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return "-";
  }
  if (value instanceof Date) {
    return value.toLocaleDateString("vi-VN");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return value as React.ReactNode;
}
DataTable.displayName = "DataTable";

export { DataTable };
export type { DataTableColumn, DataTableProps };
