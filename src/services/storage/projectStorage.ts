import { generateId } from "../../lib/id";
import { CURRENT_SCHEMA_VERSION, type Project } from "../../types/project";
import { migrateProject } from "./migrations";

const PROJECTS_KEY = "itsm:projects";
const ACTIVE_PROJECT_KEY = "itsm:activeProjectId";

function readAll(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => migrateProject(p));
  } catch {
    return [];
  }
}

function writeAll(projects: Project[]): void {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error("프로젝트 저장 실패:", err);
  }
}

export function listProjects(): Project[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getProject(id: string): Project | undefined {
  return readAll().find((p) => p.id === id);
}

export function saveProject(project: Project): Project {
  const projects = readAll();
  const now = new Date().toISOString();
  const updated: Project = { ...project, updatedAt: now };
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = updated;
  } else {
    projects.push(updated);
  }
  writeAll(projects);
  return updated;
}

export function deleteProject(id: string): void {
  const projects = readAll().filter((p) => p.id !== id);
  writeAll(projects);
  if (getActiveProjectId() === id) {
    clearActiveProjectId();
  }
}

export function duplicateProject(id: string): Project | undefined {
  const original = getProject(id);
  if (!original) return undefined;
  const now = new Date().toISOString();
  const copy: Project = {
    ...original,
    id: generateId(),
    title: `${original.title} (복제)`,
    createdAt: now,
    updatedAt: now,
  };
  const projects = readAll();
  projects.push(copy);
  writeAll(projects);
  return copy;
}

export function createEmptyProject(title = "새 웹툰 프로젝트"): Project {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    status: "material",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    materials: [],
    storySettings: { style: "auto", panelCount: 8 },
  };
}

export function getActiveProjectId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch (err) {
    console.error("활성 프로젝트 설정 실패:", err);
  }
}

export function clearActiveProjectId(): void {
  try {
    localStorage.removeItem(ACTIVE_PROJECT_KEY);
  } catch {
    // ignore
  }
}
