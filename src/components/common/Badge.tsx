import type { ReactNode } from "react";

type Tone = "neutral" | "gold" | "green" | "blue" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-white/10 bg-white/[.055] text-[#c7ced9]",
  gold: "border-[#f4b860]/22 bg-[#f4b860]/10 text-[#f7c979]",
  green: "border-[#65d89a]/22 bg-[#65d89a]/10 text-[#82e6ac]",
  blue: "border-[#75b9ff]/22 bg-[#75b9ff]/10 text-[#9acbff]",
  danger: "border-[#ff806d]/22 bg-[#ff806d]/10 text-[#ff9e90]",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

