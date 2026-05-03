"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "bg-white rounded-xl shadow-xl border border-gray-100 w-full max-w-md mx-4 sm:mx-0 p-5 sm:p-6",
          className
        )}
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
