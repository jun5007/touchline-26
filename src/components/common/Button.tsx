import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const baseClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition duration-200 disabled:cursor-not-allowed disabled:opacity-45";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#f4b860] text-[#121923] shadow-[0_10px_30px_rgba(244,184,96,.16)] hover:bg-[#ffc979] hover:-translate-y-0.5",
  secondary:
    "border border-white/14 bg-white/[.055] text-[#f5f2e8] hover:border-white/25 hover:bg-white/[.09]",
  ghost: "text-[#d8dee8] hover:bg-white/[.06] hover:text-white",
  danger:
    "border border-[#ff806d]/30 bg-[#ff806d]/10 text-[#ff9b8c] hover:bg-[#ff806d]/16",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

