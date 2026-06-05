import type { ActionFunctionArgs, MetaFunction } from "react-router";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, useActionData, useNavigation } from "react-router";

import type { RouteHandle } from "~/shared/types";

import { checkInviteExists, createInvite } from "~/server/database/invites.server";
import { verifySameOrigin } from "~/server/http/csrf.server";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  toast,
} from "~/shared/components";

export const handle: RouteHandle = {
  breadcrumb: () => "Mời Thành Viên",
};

export const meta: MetaFunction = () => [
  { title: "Mời Thành Viên - Bảng Điều Khiển" },
  { content: "Mời thành viên mới tham gia quản trị", name: "description" },
];

type ActionData = {
  email?: string;
  error?: string;
  success?: boolean;
};

import { z } from "zod";
import { zfd } from "zod-form-data";

const InviteSchema = zfd.formData({
  email: zfd.text(
    z
      .string({ message: "Email không được để trống." })
      .min(1, "Email không được để trống.")
      .email("Địa chỉ email không hợp lệ."),
  ),
});

export async function action({ request }: ActionFunctionArgs) {
  verifySameOrigin(request);

  const formData = await request.formData();
  const parsed = InviteSchema.safeParse(formData);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email } = parsed.data;

  try {
    const exists = await checkInviteExists(email);
    if (exists) {
      return Response.json(
        { error: "Email này đã được thêm vào danh sách mời trước đó." },
        { status: 400 },
      );
    }

    await createInvite(email);
    return Response.json({ email, success: true });
  } catch (err) {
    console.error("Invite error:", err);
    return Response.json(
      { error: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}

export default function InviteUser() {
  const actionData = useActionData<typeof action>() as ActionData | undefined;
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success && actionData.email) {
      toast.success("Thành công", {
        description: `Đã mời thành công email ${actionData.email}`,
      });
      formRef.current?.reset();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-start justify-center pt-8">
      <Card className="border-border w-full max-w-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Mời Thành Viên</CardTitle>
          <CardDescription>
            Thêm địa chỉ email vào danh sách được phép đăng nhập qua Google OAuth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form className="space-y-4" method="post" ref={formRef}>
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium" htmlFor="email">
                Địa chỉ Email
              </label>
              <Input
                disabled={isSubmitting}
                error={!!actionData?.error}
                id="email"
                name="email"
                placeholder="Nhập email (ví dụ: member@gmail.com)"
                required
                type="email"
              />
              {actionData?.error && (
                <p className="text-destructive mt-1 text-xs">{actionData.error}</p>
              )}
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi lời mời...
                </>
              ) : (
                "Gửi Lời Mời"
              )}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
