import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { DataTableColumn } from "~/shared/components/organisms/data-table";
import { DataTable } from "~/shared/components/organisms/data-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "~/shared/components/atoms/table";

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
    { id: "id", header: "ID", accessor: "id" },
    { id: "name", header: "Tên", accessor: "name" },
  ];

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it("renders header columns", () => {
    render(<DataTable data={data} columns={columns} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Tên")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(<DataTable data={data} columns={columns} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows skeleton rows when loading", () => {
    const { container } = render(
      <DataTable
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading
        skeletonRows={3}
      />,
      { wrapper: TestWrapper },
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty message when no data", () => {
    render(<DataTable data={[]} columns={columns} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("shows custom empty message", () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="Danh sách trống"
      />,
      { wrapper: TestWrapper },
    );
    expect(screen.getByText("Danh sách trống")).toBeInTheDocument();
  });

  it("shows custom empty state component", () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={<div>Không có gì cả</div>}
      />,
      { wrapper: TestWrapper },
    );
    expect(screen.getByText("Không có gì cả")).toBeInTheDocument();
  });

  it("cell renders custom component via cell function", () => {
    const columnsWithCustomCell = [
      { id: "id", header: "ID", accessor: "id" as const },
      {
        id: "custom",
        header: "Tuỳ chỉnh",
        cell: (item: TestItem) => <strong>{item.name.toUpperCase()}</strong>,
      },
    ];
    render(
      <DataTable data={data} columns={columnsWithCustomCell} keyExtractor={(item) => item.id} />,
      { wrapper: TestWrapper },
    );
    const strong = screen.getByText("A");
    expect(strong.tagName).toBe("STRONG");
  });

  it("applies alignment classes", () => {
    const alignedColumns = [
      { id: "id", header: "ID", accessor: "id" as const, align: "center" as const },
      { id: "name", header: "Tên", accessor: "name" as const, align: "right" as const },
    ];
    render(<DataTable data={data} columns={alignedColumns} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    const headerCenter = screen.getByText("ID");
    const headerRight = screen.getByText("Tên");
    expect(headerCenter.className).toContain("text-center");
    expect(headerRight.className).toContain("text-right");
  });

  it("renders null for column without accessor or cell", () => {
    const columnsWithNull: DataTableColumn<TestItem>[] = [
      { id: "id", header: "ID", accessor: "id" },
      { id: "empty", header: "Trống", cell: () => null },
    ];
    render(<DataTable data={data} columns={columnsWithNull} keyExtractor={(item) => item.id} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Trống")).toBeInTheDocument();
  });

  it("renders accessorFn result", () => {
    const columnsWithAccessorFn: DataTableColumn<TestItem>[] = [
      {
        id: "computed",
        header: "Computed",
        accessorFn: (item) => `${item.name}-${item.id}`,
      },
    ];
    render(
      <DataTable data={data} columns={columnsWithAccessorFn} keyExtractor={(item) => item.id} />,
      { wrapper: TestWrapper },
    );
    expect(screen.getByText("A-1")).toBeInTheDocument();
    expect(screen.getByText("B-2")).toBeInTheDocument();
  });

  it("renders dash for null/undefined values", () => {
    const dataWithNulls = [{ id: 1, name: null as string | null }];
    const columnsWithNulls: DataTableColumn<(typeof dataWithNulls)[0]>[] = [
      { id: "name", header: "Name", accessor: "name" },
    ];
    render(
      <DataTable
        data={dataWithNulls}
        columns={columnsWithNulls}
        keyExtractor={(item) => item.id}
      />,
      { wrapper: TestWrapper },
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("handles column with headerClassName and cellClassName", () => {
    const columnsWithClasses: DataTableColumn<TestItem>[] = [
      {
        id: "id",
        header: "ID",
        accessor: "id",
        headerClassName: "header-class",
        cellClassName: "cell-class",
      },
    ];
    render(
      <DataTable data={data} columns={columnsWithClasses} keyExtractor={(item) => item.id} />,
      { wrapper: TestWrapper },
    );
    const header = screen.getByText("ID");
    expect(header.className).toContain("header-class");
    const cell = screen.getByText("1");
    expect(cell.className).toContain("cell-class");
  });
});
