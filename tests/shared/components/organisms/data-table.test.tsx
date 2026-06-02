import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DataTableColumn } from "~/shared/components/organisms/data-table";

import { DataTable } from "~/shared/components/organisms/data-table";

interface TestItem {
  createdAt: Date;
  email: null | string;
  id: number;
  name: string;
}

const testData: TestItem[] = [
  { createdAt: new Date("2024-01-15"), email: "a@test.com", id: 1, name: "Nguyễn Văn A" },
  { createdAt: new Date("2024-02-20"), email: null, id: 2, name: "Trần Thị B" },
];

const baseColumns: DataTableColumn<TestItem>[] = [
  { accessor: "name", header: "Tên", id: "name" },
  { accessor: "email", header: "Email", id: "email" },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(<DataTable columns={baseColumns} data={testData} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("Tên")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders data rows with accessor", () => {
    render(<DataTable columns={baseColumns} data={testData} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
    expect(screen.getByText("a@test.com")).toBeInTheDocument();
  });

  it('renders "-" for null values', () => {
    render(<DataTable columns={baseColumns} data={testData} keyExtractor={(item) => item.id} />);
    const cells = screen.getAllByText("-");
    expect(cells.length).toBe(1);
  });

  it("renders with accessorFn", () => {
    const columns: DataTableColumn<TestItem>[] = [
      { accessorFn: (item) => item.name.toUpperCase(), header: "Tên", id: "name" },
    ];
    render(<DataTable columns={columns} data={testData} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("NGUYỄN VĂN A")).toBeInTheDocument();
  });

  it("renders with cell renderer", () => {
    const columns: DataTableColumn<TestItem>[] = [
      {
        cell: (item, index) => `${index + 1}. ${item.name}`,
        header: "Tên",
        id: "name",
      },
    ];
    render(<DataTable columns={columns} data={testData} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("1. Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("2. Trần Thị B")).toBeInTheDocument();
  });

  it("formats Date values with Vietnamese locale", () => {
    const columns: DataTableColumn<TestItem>[] = [
      { accessor: "createdAt", header: "Ngày tạo", id: "createdAt" },
    ];
    render(<DataTable columns={columns} data={[testData[0]]} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("15/1/2024")).toBeInTheDocument();
  });

  it("renders loading skeleton", () => {
    render(
      <DataTable
        columns={baseColumns}
        data={[]}
        isLoading
        keyExtractor={(item) => item.id}
        skeletonRows={5}
      />,
    );
    const skeletonCells = screen.getAllByRole("cell");
    expect(skeletonCells.length).toBe(10);
  });

  it("renders default empty message", () => {
    render(<DataTable columns={baseColumns} data={[]} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    render(
      <DataTable
        columns={baseColumns}
        data={[]}
        emptyMessage="Chưa có khách hàng"
        keyExtractor={(item) => item.id}
      />,
    );
    expect(screen.getByText("Chưa có khách hàng")).toBeInTheDocument();
  });

  it("renders custom empty state", () => {
    render(
      <DataTable
        columns={baseColumns}
        data={[]}
        emptyState={<div>Trạng thái tùy chỉnh</div>}
        keyExtractor={(item) => item.id}
      />,
    );
    expect(screen.getByText("Trạng thái tùy chỉnh")).toBeInTheDocument();
  });

  it("applies column alignment", () => {
    const columns: DataTableColumn<TestItem>[] = [
      { accessor: "name", align: "center", header: "Tên", id: "name" },
    ];
    render(<DataTable columns={columns} data={[testData[0]]} keyExtractor={(item) => item.id} />);
    const header = screen.getByText("Tên");
    expect(header.className).toContain("text-center");
  });

  it("applies custom className", () => {
    const { container } = render(
      <DataTable
        className="custom-table"
        columns={baseColumns}
        data={testData}
        keyExtractor={(item) => item.id}
      />,
    );
    expect(container.firstChild).toHaveClass("custom-table");
  });
});
