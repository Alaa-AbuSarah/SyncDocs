"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { useProjectStore } from "@/store/useProjectStore";
import { slugify, isSlugUnique } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const { createProject, projects } = useProjectStore();
  const router = useRouter();

  // Derive slug from name whenever the user hasn't manually changed it
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setSlugTouched(false);
    }
  }, [open]);

  const slugError = slug && !isSlugUnique(slug, projects) ? "Slug already taken" : null;
  const canSubmit = name.trim() && slug && !slugError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const project = await createProject(name.trim(), slug);
    onClose();
    router.push(`/docs/${project.id}`);
  };

  const handleSlugChange = (raw: string) => {
    // Keep it valid on every keystroke: lowercase, kebab-case only
    setSlug(raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"));
    setSlugTouched(true);
  };

  return (
    <Modal open={open} onClose={onClose} title="New project">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <input
          autoFocus
          type="text"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        {/* Slug */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">URL slug</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="px-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none py-2">
              /
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-project"
              className={cn(
                "flex-1 px-3 py-2 text-sm outline-none bg-white",
                slugError && "text-red-600"
              )}
            />
          </div>
          {slugError && <p className="text-xs text-red-500">{slugError}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
