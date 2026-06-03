import { Card, CardContent, CardHeader, CardTitle } from "~/shared/components";
import { Field } from "~/shared/components";

type BusinessDetailsProps = {
  address: null | string;
  businessName: null | string;
  category: null | string;
  phone: null | string;
  region: null | string;
  website: null | string;
};

export function BusinessDetails({
  address,
  businessName,
  category,
  phone,
  region,
  website,
}: BusinessDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chi Tiết</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên Doanh Nghiệp">{businessName}</Field>
          <Field label="Danh Mục">{category}</Field>
          <Field label="Địa Chỉ">{address}</Field>
          <Field label="Điện Thoại">{phone}</Field>
          <Field label="Website">{website}</Field>
          <Field label="Khu Vực">{region}</Field>
        </div>
      </CardContent>
    </Card>
  );
}
