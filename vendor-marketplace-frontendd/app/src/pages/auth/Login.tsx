import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { LockKeyhole, Mail, UserRound } from "lucide-react";

import type { Route } from "./+types/Login";

import AuthPageShell from "~/src/components/auth/AuthPageShell";
import AppButton from "~/src/components/ui/AppButton";
import TextField from "~/src/components/ui/TextField";

import {
  AuthServiceError,
  loginClient,
} from "~/src/services/auth.server";

import { createAuthCookie } from "~/src/lib/session.server";

interface LoginActionData {
  error?: string;
  kind?: "error" | "role";
}

function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "/";
  }

  const path = value.trim();

  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return "/";
  }

  return path;
}

export function meta() {
  return [
    {
      title: "Masuk sebagai Client | LayananPro",
    },
    {
      name: "description",
      content:
        "Masuk ke akun Client LayananPro untuk mengakses marketplace dan mengelola kebutuhan proyek.",
    },
  ];
}

export async function action({
  request,
}: Route.ActionArgs) {
  const formData = await request.formData();

  const email = String(
    formData.get("email") ?? "",
  ).trim();

  const password = String(
    formData.get("password") ?? "",
  );

  if (!email || !password) {
    return {
      error: "Email dan kata sandi wajib diisi.",
      kind: "error",
    } satisfies LoginActionData;
  }

  try {
    const auth = await loginClient({
      email,
      password,
    });

    const nextPath = safeNextPath(
      formData.get("next"),
    );

    return redirect(nextPath, {
      headers: {
        "Set-Cookie": createAuthCookie(
          auth.access_token,
        ),
      },
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return {
        error: error.message,
        kind:
          error.code === "ROLE_MISMATCH"
            ? "role"
            : "error",
      } satisfies LoginActionData;
    }

    return {
      error:
        "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
      kind: "error",
    } satisfies LoginActionData;
  }
}

export default function Login() {
  const navigation = useNavigation();

  const actionData =
    useActionData<LoginActionData>();

  const [searchParams] = useSearchParams();

  const next =
    searchParams.get("next") ?? "";

  const isSubmitting =
    navigation.state === "submitting";

  return (
    <AuthPageShell>
      <div className="mb-8">

        <h1 className="text-xl font-bold tracking-tight text-slate-950">
          Selamat datang kembali
        </h1>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Masuk untuk melanjutkan pencarian layanan,
          mengelola proyek, dan melihat aktivitas akunmu
        </p>
      </div>

      {actionData?.error && (
        <div
          className={[
            "mb-6 rounded-xl border px-4 py-3",
            actionData.kind === "role"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-rose-200 bg-rose-50 text-rose-700",
          ].join(" ")}
          role="alert"
        >
          <p className="text-sm font-semibold">
            {actionData.kind === "role"
              ? "Akun bukan Client"
              : "Login gagal"}
          </p>

          <p className="mt-1 text-xs leading-5">
            {actionData.error}
          </p>

          {actionData.kind === "role" && (
            <Link
              to="/"
              className="mt-2 inline-block text-xs font-semibold underline underline-offset-2"
            >
              Kembali pilih jenis akun
            </Link>
          )}
        </div>
      )}

      <Form
        method="post"
        className="space-y-5"
      >
        <input
          type="hidden"
          name="next"
          value={next}
        />

        <TextField
          label="Alamat email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          required
          disabled={isSubmitting}
          icon={<Mail size={18} />}
        />

        <TextField
          label="Kata sandi"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan kata sandi"
          required
          disabled={isSubmitting}
          icon={<LockKeyhole size={18} />}
        />

        <AppButton
          type="submit"
          loading={isSubmitting}
          fullWidth
        >
          {isSubmitting
            ? "Memeriksa akun..."
            : "Masuk"}
        </AppButton>
      </Form>

      <div className="mt-4 border-t border-slate-100 pt-6">
        <p className="text-center text-xs text-slate-500">
          Belum punya akun?{" "}
          <Link
            to="/"
            className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </AuthPageShell>
  );
}