import { createContext, useContext, type ReactNode } from "react";
import { useProject } from "../hooks/useProject";

type ProjectContextValue = ReturnType<typeof useProject>;

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const value = useProject();
  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

/** 앱 전체에서 하나의 프로젝트 상태를 공유한다. 페이지 이동 시 저장 디바운스로 인한 데이터 유실을 방지한다. */
export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjectContext는 ProjectProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
