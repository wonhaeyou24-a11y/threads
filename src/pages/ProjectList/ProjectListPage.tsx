import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../contexts/ProjectContext";
import {
  deleteProject,
  duplicateProject,
  listProjects,
} from "../../services/storage/projectStorage";
import type { Project, ProjectStatus } from "../../types/project";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  material: "소재 입력 중",
  story_selection: "이야기 선택 중",
  storyboard: "콘티 작업 중",
  completed: "완료",
};

function routeForStatus(status: ProjectStatus): string {
  switch (status) {
    case "material":
      return "/";
    case "story_selection":
      return "/workspace";
    case "storyboard":
    case "completed":
      return "/storyboard";
    default:
      return "/";
  }
}

export function ProjectListPage() {
  const { loadProject, startNewProject } = useProjectContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(() => listProjects());

  const refresh = () => setProjects(listProjects());

  const handleOpen = (project: Project) => {
    loadProject(project.id);
    navigate(routeForStatus(project.status));
  };

  const handleDelete = (project: Project) => {
    const confirmed = window.confirm(
      `"${project.title}" 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
    );
    if (!confirmed) return;
    deleteProject(project.id);
    refresh();
  };

  const handleDuplicate = (project: Project) => {
    duplicateProject(project.id);
    refresh();
  };

  const handleNewProject = () => {
    startNewProject();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-3xl mx-auto px-4 pt-10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            내 웹툰 프로젝트
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            저장된 프로젝트를 열거나 새로 시작할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleNewProject} className="whitespace-nowrap self-start sm:self-auto">
          새 프로젝트
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-16 flex flex-col gap-3">
        {projects.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">
            저장된 프로젝트가 없습니다.
          </p>
        )}
        {projects.map((project) => (
          <Card
            key={project.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {project.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {STATUS_LABEL[project.status]} · 최근 수정:{" "}
                {new Date(project.updatedAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="secondary"
                className="text-xs py-1.5"
                onClick={() => handleOpen(project)}
              >
                열기
              </Button>
              <Button
                variant="secondary"
                className="text-xs py-1.5"
                onClick={() => handleDuplicate(project)}
              >
                복제
              </Button>
              <Button
                variant="danger"
                className="text-xs py-1.5"
                onClick={() => handleDelete(project)}
              >
                삭제
              </Button>
            </div>
          </Card>
        ))}
      </main>
    </div>
  );
}
