"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3.5 py-2 text-sm",
        variant === "primary" &&
          "bg-blue-600 text-white hover:bg-blue-700",
        variant === "ghost" &&
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        variant === "danger" &&
          "bg-red-50 text-red-600 hover:bg-red-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
