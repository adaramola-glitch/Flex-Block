"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-purple-700 text-white hover:bg-purple-600",
  danger: "bg-red-600 text-white hover:bg-red-500",
  outline:
    "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
} as const;

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  variant?: keyof typeof variants;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {pending ? pendingText ?? "Working…" : children}
    </button>
  );
}
