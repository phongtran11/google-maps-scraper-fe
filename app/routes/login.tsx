import { useState } from "react";
import type { MetaFunction } from "react-router";
import { useSearchParams } from "react-router";
import { Spinner } from "~/shared/icons/spinner";
import { Google } from "~/shared/icons/google";
import { authClient } from "~/shared/utils";

export const meta: MetaFunction = () => [
  { title: "Đăng Nhập - Bảng Điều Khiển" },
  { name: "description", content: "Đăng nhập để truy cập bảng điều khiển" },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Trang Quản Trị</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Đăng nhập bằng tài khoản Google để tiếp tục
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
            Tài khoản của bạn không được phép truy cập. Liên hệ quản trị viên để được mời.
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex w-full items-center justify-center gap-3 rounded-md border px-4 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? <Spinner className="h-5 w-5" /> : <Google className="h-5 w-5" />}
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
}
