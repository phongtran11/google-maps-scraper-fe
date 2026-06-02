import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { DataTableColumn } from "~/shared/components/organisms/data-table";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/atoms/table";
import { DataTable } from "~/shared/components/organisms/data-table";

describe("Table primitives", () => {
  it("renders Table with default variant", () => {
    render(
      <Table>
        <tbody />
      </Table>,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders all variants", () => {
    const variants = ["default", "striped", "bordered"] as const;
    for (const variant of variants) {
      const { unmount } = render(
        <Table variant={variant}>
          <tbody />
        </Table>,
      );
      expect(screen.getByRole("table")).toBeInTheDocument();
      unmount();
    }
  });

  it("renders TableHeader", () => {
    render(
      <table>
        <TableHeader />
      </table>,
    );
    expect(document.querySelector("thead")).toBeInTheDocument();
  });

  it("renders TableBody", () => {
    render(
      <table>
        <TableBody />
      </table>,
    );
    expect(document.querySelector("tbody")).toBeInTheDocument();
  });

  it("renders TableFooter", () => {
    render(
      <table>
        <TableFooter />
      </table>,
    );
    expect(document.querySelector("tfoot")).toBeInTheDocument();
  });

  it("renders TableHead", () => {
    render(
      <table>
        <thead>
          <TableRow>
            <TableHead>Tiêu đề</TableHead>
          </TableRow>
        </thead>
      </table>,
    );
    expect(screen.getByText("Tiêu đề").tagName).toBe("TH");
  });

  it("renders TableRow", () => {
    render(
      <table>
        <tbody>
          <TableRow>
            <td>Dữ liệu</td>
          </TableRow>
        </tbody>
      </table>,
    );
    expect(screen.getByText("Dữ liệu").closest("tr")).toBeInTheDocument();
  });

  it("renders TableCell", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>Ô</TableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText("Ô").tagName).toBe("TD");
  });

  it("renders TableCaption", () => {
    render(
      <table>
        <TableCaption>Chú thích</TableCaption>
        <tbody />
      </table>,
    );
    expect(screen.getByText("Chú thích").tagName).toBe("CAPTION");
  });

  it("renders Table with sticky header", () => {
    render(
      <Table stickyHeader>
        <thead>
          <tr>
            <th>Đầu</th>
          </tr>
        </thead>
        <tbody />
      </Table>,
    );
    const table = screen.getByRole("table");
    expect(table.className).toContain("sticky");
  });
});

describe("DataTable", () => {
  interface TestItem {
    id: number;
    name: string;
  }

  const data: TestItem[] = [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
  ];

  const columns: DataTableColumn<TestItem>[] = [
    { accessor: "id", header: "ID", id: "id" },
    { accessor: "name", header: "Tên", id: "name" },
  ];

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it("renders header columns", () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Tên")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(<DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows skeleton rows when loading", () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={[]}
        isLoading
        keyExtractor={(item) => item.id}
        skeletonRows={3}
      />,
      { wrapper: TestWrapper },
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty message when no data", () => {
    render(<DataTable columns={columns} data={[]} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("shows custom empty message", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="Danh sách trống"
        keyExtractor={(item) => item.id}
      />,
      { wrapper: TestWrapper },
    );
    expect(screen.getByText("Danh sách trống")).toBeInTheDocument();
  });

  it("shows custom empty state component", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyState={<div>Không có gì cả</div>}
        keyExtractor={(item) => item.id}
      />,
      { wrapper: TestWrapper },
    );
    expect(screen.getByText("Không có gì cả")).toBeInTheDocument();
  });

  it("cell renders custom component via cell function", () => {
    const columnsWithCustomCell = [
      { accessor: "id" as const, header: "ID", id: "id" },
      {
        cell: (item: TestItem) => <strong>{item.name.toUpperCase()}</strong>,
        header: "Tuỳ chỉnh",
        id: "custom",
      },
    ];
    render(
      <DataTable columns={columnsWithCustomCell} data={data} keyExtractor={(item) => item.id} />,
      { wrapper: TestWrapper },
    );
    const strong = screen.getByText("A");
    expect(strong.tagName).toBe("STRONG");
  });

  it("applies alignment classes", () => {
    const alignedColumns = [
      { accessor: "id" as const, align: "center" as const, header: "ID", id: "id" },
      { accessor: "name" as const, align: "right" as const, header: "Tên", id: "name" },
    ];
    render(<DataTable columns={alignedColumns} data={data} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    const headerCenter = screen.getByText("ID");
    const headerRight = screen.getByText("Tên");
    expect(headerCenter.className).toContain("text-center");
    expect(headerRight.className).toContain("text-right");
  });

  it("renders null for column without accessor or cell", () => {
    const columnsWithNull: DataTableColumn<TestItem>[] = [
      { accessor: "id", header: "ID", id: "id" },
      { cell: () => null, header: "Trống", id: "empty" },
    ];
    render(<DataTable columns={columnsWithNull} data={data} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Trống")).toBeInTheDocument();
  });

  it("renders accessorFn result", () => {
    const columnsWithAccessorFn: DataTableColumn<TestItem>[] = [
      {
        accessorFn: (item) => `${item.name}-${item.id}`,
        header: "Computed",
        id: "computed",
      },
    ];
    render(
      <DataTable columns={columnsWithAccessorFn} data={data} keyExtractor={(item) => item.id} />,
      { wrapper: TestWrapper },
    );
    expect(screen.getByText("A-1")).toBeInTheDocument();
    expect(screen.getByText("B-2")).toBeInTheDocument();
  });

  it("renders dash for null/undefined values", () => {
    const dataWithNulls = [{ id: 1, name: null as null | string }];
    const columnsWithNulls: DataTableColumn<(typeof dataWithNulls)[0]>[] = [
      { accessor: "name", header: "Name", id: "name" },
    ];
    render(
      <DataTable
        columns={columnsWithNulls}
        data={dataWithNulls}
        keyExtractor={(item) => item.id}
      />,
      { wrapper: TestWrapper },
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("handles column with headerClassName and cellClassName", () => {
    const columnsWithClasses: DataTableColumn<TestItem>[] = [
      {
        accessor: "id",
        cellClassName: "cell-class",
        header: "ID",
        headerClassName: "header-class",
        id: "id",
      },
    ];
    render(
      <DataTable columns={columnsWithClasses} data={data} keyExtractor={(item) => item.id} />,
      { wrapper: TestWrapper },
    );
    const header = screen.getByText("ID");
    expect(header.className).toContain("header-class");
    const cell = screen.getByText("1");
    expect(cell.className).toContain("cell-class");
  });
});
