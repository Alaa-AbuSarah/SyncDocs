"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

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
        "inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" && "text-xs px-2.5 py-1.5",
        size === "md" && "text-sm px-4 py-2",
        variant === "primary" &&
          "bg-gray-900 text-white hover:bg-gray-700",
        variant === "ghost" &&
          "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        variant === "danger" &&
          "bg-transparent text-red-600 hover:bg-red-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
