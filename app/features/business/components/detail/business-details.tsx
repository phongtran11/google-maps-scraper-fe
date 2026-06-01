import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components";
import { Field } from "~/shared/components";

import type { BusinessRow } from "../../types";

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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên Doanh Nghiệp">{b.business_name}</Field>
          <Field label="Danh Mục">{b.category}</Field>
          <Field label="Địa Chỉ">{b.address}</Field>
          <Field label="Điện Thoại">{b.phone}</Field>
          <Field label="Website">{b.website}</Field>
          <Field label="Khu Vực">{b.region}</Field>
        </div>
      </CardContent>
    </Card>
  );
}
