import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { LockKeyhole, Mail, UserRound, ArrowLeft } from "lucide-react";

import type { Route } from "./+types/Login";

import {useState} from "react";
import AuthPageShell from "~/src/components/auth/AuthPageShell";
import AppButton from "~/src/components/common/AppButton";
import TextField from "~/src/components/common/TextField";
import AuthModal from "~/src/components/common/AuthModal";

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

  if (!path.startsWith("/") || path.startsWith("//")) {
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
    const auth = await loginClient({
      email,
      password,
    });

    const nextPath = safeNextPath(formData.get("next"));

    return redirect(nextPath, {
      headers: {
        "Set-Cookie": createAuthCookie(auth.access_token),
      },
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return {
        error: error.message,
        kind: error.code === "ROLE_MISMATCH" ? "role" : "error",
      } satisfies LoginActionData;
    }

    return {
      error: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
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
      {/* Header Form Login */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-sm border border-blue-100">
          <UserRound size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Selamat datang kembali
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-sm mx-auto">
          Masuk untuk melanjutkan pencarian layanan, mengelola proyek, dan
          melihat aktivitas akunmu.
        </p>
      </div>

      {/* Error Alert Box */}
      {actionData?.error && (
        <div
          className={`mb-6 rounded-2xl border p-4 flex items-start gap-3 ${
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
              className="text-[11px] font-bold uppercase tracking-wider text-amber-700 hover:text-amber-900 flex items-center gap-1 mt-0.5 whitespace-nowrap"
            >
              <ArrowLeft size={12} />
              Kembali
            </Link>
          )}
        </div>
      )}

      {/* Form Area */}
      <Form method="post" className="space-y-5 bg-white">
        <input type="hidden" name="next" value={next} />

        <div className="space-y-4">
          <TextField
            label="Alamat Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            required
            disabled={isSubmitting}
            icon={<Mail size={18} />}
          />

          <div className="space-y-1">
            <TextField
              label="Kata Sandi"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan kata sandi"
              required
              disabled={isSubmitting}
              icon={<LockKeyhole size={18} />}
            />
            {/* Lupa Password Link (Opsional UX) */}
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Lupa kata sandi?
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <AppButton type="submit" loading={isSubmitting} fullWidth>
            {isSubmitting ? "Memeriksa akun..." : "Masuk Sekarang"}
          </AppButton>
        </div>
      </Form>

      {/* Footer / Register Link */}
<div className="mt-8 border-t border-slate-100 pt-6">
  <p className="text-center text-sm font-medium text-slate-500">
    Belum punya akun?{" "}
    <button
      type="button"
      onClick={() => setIsRegisterModalOpen(true)}
      className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
    >
      Daftar sekarang
    </button>
  </p>
</div>

{/* Modal Pilih Registrasi (Client vs Merchant) */}
<AuthModal
  isOpen={isRegisterModalOpen}
  onClose={() => setIsRegisterModalOpen(false)}
/>
    </AuthPageShell>
  );
}