"use client";

import { useState, useEffect, useCallback } from "react";
import { Project } from "@/types";
import {
  getAllProjects,
  saveProject,
  deleteProject as removeProject,
} from "@/lib/storage/projects";
import { generateId } from "@/lib/utils";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(getAllProjects());
  }, []);

  const createProject = useCallback((name: string): Project => {
    const project: Project = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
    };
    saveProject(project);
    setProjects(getAllProjects());
    return project;
  }, []);

  const deleteProject = useCallback((id: string) => {
    removeProject(id);
    setProjects(getAllProjects());
  }, []);

  return { projects, createProject, deleteProject };
}
