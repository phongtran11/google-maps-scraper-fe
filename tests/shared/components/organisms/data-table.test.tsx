import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DataTableColumn } from "~/shared/components/organisms/data-table";
import { DataTable } from "~/shared/components/organisms/data-table";

interface TestItem {
  id: number;
  name: string;
  email: string | null;
  createdAt: Date;
}

const testData: TestItem[] = [
  { id: 1, name: "Nguyễn Văn A", email: "a@test.com", createdAt: new Date("2024-01-15") },
  { id: 2, name: "Trần Thị B", email: null, createdAt: new Date("2024-02-20") },
];

const baseColumns: DataTableColumn<TestItem>[] = [
  { id: "name", header: "Tên", accessor: "name" },
  { id: "email", header: "Email", accessor: "email" },
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(<DataTable data={testData} columns={baseColumns} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("Tên")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders data rows with accessor", () => {
    render(<DataTable data={testData} columns={baseColumns} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
    expect(screen.getByText("a@test.com")).toBeInTheDocument();
  });

  it('renders "-" for null values', () => {
    render(<DataTable data={testData} columns={baseColumns} keyExtractor={(item) => item.id} />);
    const cells = screen.getAllByText("-");
    expect(cells.length).toBe(1);
  });

  it("renders with accessorFn", () => {
    const columns: DataTableColumn<TestItem>[] = [
      { id: "name", header: "Tên", accessorFn: (item) => item.name.toUpperCase() },
    ];
    render(<DataTable data={testData} columns={columns} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("NGUYỄN VĂN A")).toBeInTheDocument();
  });

  it("renders with cell renderer", () => {
    const columns: DataTableColumn<TestItem>[] = [
      {
        id: "name",
        header: "Tên",
        cell: (item, index) => `${index + 1}. ${item.name}`,
      },
    ];
    render(<DataTable data={testData} columns={columns} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("1. Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("2. Trần Thị B")).toBeInTheDocument();
  });

  it("formats Date values with Vietnamese locale", () => {
    const columns: DataTableColumn<TestItem>[] = [
      { id: "createdAt", header: "Ngày tạo", accessor: "createdAt" },
    ];
    render(<DataTable data={[testData[0]]} columns={columns} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("15/1/2024")).toBeInTheDocument();
  });

  it("renders loading skeleton", () => {
    render(
      <DataTable
        data={[]}
        columns={baseColumns}
        keyExtractor={(item) => item.id}
        isLoading
        skeletonRows={5}
      />,
    );
    const skeletonCells = screen.getAllByRole("cell");
    expect(skeletonCells.length).toBe(10);
  });

  it("renders default empty message", () => {
    render(<DataTable data={[]} columns={baseColumns} keyExtractor={(item) => item.id} />);
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    render(
      <DataTable
        data={[]}
        columns={baseColumns}
        keyExtractor={(item) => item.id}
        emptyMessage="Chưa có khách hàng"
      />,
    );
    expect(screen.getByText("Chưa có khách hàng")).toBeInTheDocument();
  });

  it("renders custom empty state", () => {
    render(
      <DataTable
        data={[]}
        columns={baseColumns}
        keyExtractor={(item) => item.id}
        emptyState={<div>Trạng thái tùy chỉnh</div>}
      />,
    );
    expect(screen.getByText("Trạng thái tùy chỉnh")).toBeInTheDocument();
  });

  it("applies column alignment", () => {
    const columns: DataTableColumn<TestItem>[] = [
      { id: "name", header: "Tên", accessor: "name", align: "center" },
    ];
    render(<DataTable data={[testData[0]]} columns={columns} keyExtractor={(item) => item.id} />);
    const header = screen.getByText("Tên");
    expect(header.className).toContain("text-center");
  });

  it("applies custom className", () => {
    const { container } = render(
      <DataTable
        data={testData}
        columns={baseColumns}
        keyExtractor={(item) => item.id}
        className="custom-table"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-table");
  });
});
