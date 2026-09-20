import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Eye, EyeOff } from "lucide-react";

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  icon?: ReactNode;
  error?: string;
}

export default function TextField({
  label,
  icon,
  error,
  type = "text",
  className = "",
  ...props
}: TextFieldProps) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const currentType =
    isPassword && showPassword ? "text" : type;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={currentType}
          className={[
            "h-12 w-full rounded-xl border bg-white text-sm text-slate-900",
            "placeholder:text-slate-400",
            "transition",
            "focus:outline-none focus:ring-4",
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100",
            icon ? "pl-11" : "pl-4",
            isPassword ? "pr-12" : "pr-4",
            className,
          ].join(" ")}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
            aria-label={
              showPassword
                ? "Sembunyikan kata sandi"
                : "Tampilkan kata sandi"
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-600">
          {error}
        </p>
      )}
    </label>
  );
}