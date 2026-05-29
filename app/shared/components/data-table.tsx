import { cn } from "~/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  tableVariants,
} from "./table";

interface DataTableColumnBase {
  id: string;
  header: React.ReactNode;
  cellClassName?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

type DataTableColumnWithAccessor<T> = DataTableColumnBase & {
  accessor: keyof T;
  accessorFn?: never;
  cell?: never;
};

type DataTableColumnWithAccessorFn<T> = DataTableColumnBase & {
  accessorFn: (item: T) => React.ReactNode;
  accessor?: never;
  cell?: never;
};

type DataTableColumnWithCell<T> = DataTableColumnBase & {
  cell: (item: T, index: number) => React.ReactNode;
  accessor?: never;
  accessorFn?: never;
};

type DataTableColumn<T> =
  | DataTableColumnWithAccessor<T>
  | DataTableColumnWithAccessorFn<T>
  | DataTableColumnWithCell<T>;

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  variant?: keyof typeof tableVariants.variant;
  tableSize?: keyof typeof tableVariants.size;
  stickyHeader?: boolean;
  className?: string;
  wrapperClassName?: string;
}

function renderCellValue<T>(value: unknown): React.ReactNode {
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

interface DataTableSkeletonProps<T> {
  columns: DataTableColumn<T>[];
  rows?: number;
}

function DataTableSkeleton<T>({
  columns,
  rows = 20,
}: DataTableSkeletonProps<T>) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={`skeleton-${rowIdx}`}>
          {columns.map((col) => (
            <TableCell key={col.id} className={col.cellClassName}>
              <div
                className={cn(
                  "h-5.5 animate-pulse rounded bg-muted",
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

interface DataTableEmptyProps<T> {
  columns: DataTableColumn<T>[];
  message?: string;
  state?: React.ReactNode;
}

function DataTableEmpty<T>({
  columns,
  message,
  state,
}: DataTableEmptyProps<T>) {
  return (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        {state ?? (
          <span className="text-muted-foreground">
            {message ?? "Không có dữ liệu"}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}

function DataTableContent<T>({
  data,
  columns,
  keyExtractor,
}: {
  data: T[];
  columns: DataTableColumn<T>[];
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
            key={col.id}
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
  ));
}

function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  skeletonRows = 20,
  emptyMessage,
  emptyState,
  variant = "default",
  tableSize = "md",
  stickyHeader = false,
  className,
  wrapperClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn("space-y-0", className)}>
      <Table
        variant={variant}
        tableSize={tableSize}
        stickyHeader={stickyHeader}
        wrapperClassName={wrapperClassName}
      >
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.headerClassName,
                )}
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
            <DataTableEmpty
              columns={columns}
              message={emptyMessage}
              state={emptyState}
            />
          ) : (
            <DataTableContent
              data={data}
              columns={columns}
              keyExtractor={keyExtractor}
            />
          )}
        </TableBody>
      </Table>
    </div>
  );
}
DataTable.displayName = "DataTable";

export { DataTable, DataTableSkeleton, DataTableEmpty };
export type { DataTableProps, DataTableColumn };
