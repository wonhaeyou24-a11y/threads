import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "../types/project";
import {
  createEmptyProject,
  getActiveProjectId,
  getProject,
  saveProject,
  setActiveProjectId,
} from "../services/storage/projectStorage";

/**
 * 현재 작업 중인 프로젝트를 관리하고, 변경 시 자동으로 localStorage에 저장한다.
 * 새로고침해도 activeProjectId를 통해 마지막 작업을 복원한다.
 */
export function useProject() {
  const [project, setProjectState] = useState<Project>(() => {
    const activeId = getActiveProjectId();
    if (activeId) {
      const existing = getProject(activeId);
      if (existing) return existing;
    }
    const fresh = createEmptyProject();
    saveProject(fresh);
    setActiveProjectId(fresh.id);
    return fresh;
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((next: Project) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProject(next);
    }, 300);
  }, []);

  const updateProject = useCallback(
    (updater: (prev: Project) => Project) => {
      setProjectState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const loadProject = useCallback((id: string) => {
    const existing = getProject(id);
    if (existing) {
      setProjectState(existing);
      setActiveProjectId(id);
    }
  }, []);

  const startNewProject = useCallback(() => {
    const fresh = createEmptyProject();
    saveProject(fresh);
    setActiveProjectId(fresh.id);
    setProjectState(fresh);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { project, updateProject, loadProject, startNewProject };
}
