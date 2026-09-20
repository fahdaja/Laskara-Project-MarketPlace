import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

interface AppButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function AppButton({
  children,
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: AppButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex h-12 items-center justify-center gap-2 rounded-xl",
        "bg-blue-600 px-5 text-sm font-semibold text-white",
        "transition-colors duration-200",
        "hover:bg-blue-700",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
        "disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <LoaderCircle
          size={18}
          className="animate-spin"
          aria-hidden="true"
        />
      )}

      {children}
    </button>
  );
}