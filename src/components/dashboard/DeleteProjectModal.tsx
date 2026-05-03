"use client";
import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";

interface DeleteProjectModalProps {
  open: boolean;
  projectName: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteProjectModal({ open, projectName, onConfirm, onClose }: DeleteProjectModalProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const match = typed === projectName;

  const handleConfirm = () => {
    if (!match) return;
    onConfirm();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Delete project">
      <div className="flex flex-col gap-5">
        {/* Warning */}
        <div className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm text-red-700 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-semibold">{projectName}</span> and all its
            pages. This action cannot be undone.
          </p>
        </div>

        {/* Confirm by typing */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">
            Type{" "}
            <span className="font-semibold text-gray-900 select-all">{projectName}</span>{" "}
            to confirm
          </label>
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            placeholder={projectName}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 placeholder:text-gray-300"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <button
            onClick={handleConfirm}
            disabled={!match}
            className="px-3.5 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Delete project
          </button>
        </div>
      </div>
    </Modal>
  );
}
