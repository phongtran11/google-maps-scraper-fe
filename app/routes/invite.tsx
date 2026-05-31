import { useEffect, useRef } from "react";
import type { MetaFunction, ActionFunctionArgs } from "react-router";
import { Form, useActionData, useNavigation } from "react-router";
import { verifySameOrigin } from "~/server/http/csrf.server";
import { createInvite, checkInviteExists } from "~/server/database/invites.server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
  useToast,
} from "~/shared/components";
import { Spinner } from "~/shared/icons/spinner";

export const meta: MetaFunction = () => [
  { title: "Mời Thành Viên - Bảng Điều Khiển" },
  { name: "description", content: "Mời thành viên mới tham gia quản trị" },
];

interface ActionData {
  success?: boolean;
  email?: string;
  error?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  verifySameOrigin(request);

  const formData = await request.formData();
  const email = formData.get("email")?.toString()?.trim();

  if (!email) {
    return Response.json({ error: "Email không được để trống." }, { status: 400 });
  }

  // Basic email regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json({ error: "Địa chỉ email không hợp lệ." }, { status: 400 });
  }

  try {
    const exists = await checkInviteExists(email);
    if (exists) {
      return Response.json(
        { error: "Email này đã được thêm vào danh sách mời trước đó." },
        { status: 400 },
      );
    }

    await createInvite(email);
    return Response.json({ success: true, email });
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
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success && actionData.email) {
      toast({
        title: "Thành công",
        description: `Đã mời thành công email ${actionData.email}`,
        variant: "success",
      });
      formRef.current?.reset();
    }
  }, [actionData, toast]);

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
          <Form ref={formRef} method="post" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-foreground text-sm font-medium">
                Địa chỉ Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email (ví dụ: member@gmail.com)"
                required
                disabled={isSubmitting}
                error={!!actionData?.error}
              />
              {actionData?.error && (
                <p className="text-destructive mt-1 text-xs">{actionData.error}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
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
