import { useState } from "react";

import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";

import { ArrowLeft, LockKeyhole, Mail, UserRound } from "lucide-react";

import type { Route } from "./+types/Login";

import AuthPageShell from "~/src/components/auth/AuthPageShell";
import AppButton from "~/src/components/common/AppButton";
import TextField from "~/src/components/common/TextField";
import AuthModal from "~/src/components/common/AuthModal";

import { AuthServiceError, loginClient } from "~/src/services/auth";

interface LoginActionData {
  error?: string;

  kind?: "error" | "role";
}

const DEFAULT_CLIENT_PATH = "/marketplace";

function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return DEFAULT_CLIENT_PATH;
  }

  const path = value.trim();

  if (!path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_CLIENT_PATH;
  }

  return path || DEFAULT_CLIENT_PATH;
}

export function meta() {
  return [
    {
      title: "Masuk sebagai Client | LayananPro",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const email = String(formData.get("email") ?? "").trim();

  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      error: "Email dan kata sandi wajib diisi.",

      kind: "error",
    } satisfies LoginActionData;
  }

  try {
    await loginClient({
      email,
      password,
    });

    const nextPath = safeNextPath(formData.get("next"));

    /**
     * Tidak ada cookie.
     * Tidak ada JWT.
     * Tidak ada session.
     */
    return redirect(nextPath);
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return {
        error: error.message,

        kind: error.code === "ROLE_MISMATCH" ? "role" : "error",
      } satisfies LoginActionData;
    }

    return {
      error: "Terjadi kesalahan. Silakan coba lagi.",

      kind: "error",
    } satisfies LoginActionData;
  }
}

export default function Login() {
  const navigation = useNavigation();

  const actionData = useActionData<LoginActionData>();

  const [searchParams] = useSearchParams();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const next = searchParams.get("next") ?? "";

  const isSubmitting = navigation.state === "submitting";

  return (
    <AuthPageShell>
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
          <UserRound size={28} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Selamat datang kembali
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Masuk untuk melanjutkan pencarian layanan, mengelola proyek, dan
          melihat aktivitas akunmu.
        </p>
      </div>

      {actionData?.error && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
            actionData.kind === "role"
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
          role="alert"
        >
          <div className="flex-1">
            <p className="text-sm font-bold">
              {actionData.kind === "role" ? "Akun bukan Client" : "Login gagal"}
            </p>

            <p className="mt-1 text-xs font-medium leading-relaxed opacity-90">
              {actionData.error}
            </p>
          </div>

          {actionData.kind === "role" && (
            <Link
              to="/"
              className="mt-0.5 flex items-center gap-1 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-amber-700 hover:text-amber-900"
            >
              <ArrowLeft size={12} />
              Kembali
            </Link>
          )}
        </div>
      )}

      <Form method="post" className="space-y-5 bg-white">
        <input type="hidden" name="next" value={next} />

        <div className="space-y-4">
          <TextField
            label="Alamat Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="client@test.com"
            required
            disabled={isSubmitting}
            icon={<Mail size={18} />}
          />

          <TextField
            label="Kata Sandi"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Test1234!"
            required
            disabled={isSubmitting}
            icon={<LockKeyhole size={18} />}
          />
        </div>

        <div className="pt-2">
          <AppButton type="submit" loading={isSubmitting} fullWidth>
            {isSubmitting ? "Memeriksa akun..." : "Masuk Sekarang"}
          </AppButton>
        </div>
      </Form>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <p className="text-center text-sm font-medium text-slate-500">
          Belum punya akun?{" "}
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="font-bold text-blue-600 hover:underline"
          >
            Daftar sekarang
          </button>
        </p>
      </div>

      <AuthModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </AuthPageShell>
  );
}
