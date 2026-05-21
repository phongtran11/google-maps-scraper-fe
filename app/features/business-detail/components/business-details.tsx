import { Card, CardContent, CardHeader, CardTitle } from "~/components/molecules/card";
import { Field } from "~/components/atoms/field";
import type { BusinessRow } from "~/lib/types";

interface BusinessDetailsProps {
  business: BusinessRow;
}

export function BusinessDetails({ business: b }: BusinessDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi Tiết</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên Doanh Nghiệp">{b.business_name}</Field>
          <Field label="Danh Mục">{b.category}</Field>
          <Field label="Địa Chỉ">{b.address}</Field>
          <Field label="Điện Thoại">{b.phone}</Field>
          <Field label="Khu Vực">{b.region}</Field>
          <Field label="Từ Khóa Tìm Kiếm">{b.search_keyword}</Field>
          <Field label="Thu Thập Lúc">
            {b.scraped_at ? new Date(b.scraped_at).toLocaleString() : null}
          </Field>
          <Field label="Tạo Lúc">
            {new Date(b.created_at).toLocaleString()}
          </Field>
        </dl>
      </CardContent>
    </Card>
  );
}
