import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../contexts/ProjectContext";
import { generateStoryboard } from "../../services/ai/storyboardGenerator";
import { AIServiceError, RateLimitError } from "../../services/ai/aiClient";
import { PanelCard } from "../../components/storyboard/PanelCard";
import { ProgressSteps } from "../../components/common/ProgressSteps";
import { Button } from "../../components/common/Button";
import { generateId } from "../../lib/id";
import type { StoryboardPanel } from "../../types/storyboard";

export function StoryboardPage() {
  const { project, updateProject } = useProjectContext();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCandidate = project.candidates?.find(
    (c) => c.id === project.selectedCandidateId
  );

  const runGeneration = useCallback(async () => {
    if (!selectedCandidate) return;
    setStatus("loading");
    setErrorMessage(null);
    try {
      const panels = await generateStoryboard(
        selectedCandidate,
        project.storySettings.panelCount
      );
      updateProject((prev) => ({
        ...prev,
        storyboard: {
          id: generateId(),
          storyId: selectedCandidate.id,
          panelCount: panels.length,
          panels,
        },
        status: "storyboard",
      }));
      setStatus("idle");
    } catch (err) {
      const message =
        err instanceof RateLimitError
          ? err.message
          : err instanceof AIServiceError
          ? err.message
          : "콘티를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
      setErrorMessage(message);
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCandidate, project.storySettings.panelCount]);

  useEffect(() => {
    if (!selectedCandidate) {
      navigate("/workspace", { replace: true });
      return;
    }
    if (!project.storyboard) {
      runGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePanelChange = (updated: StoryboardPanel) => {
    updateProject((prev) => {
      if (!prev.storyboard) return prev;
      return {
        ...prev,
        storyboard: {
          ...prev.storyboard,
          panels: prev.storyboard.panels.map((p) =>
            p.id === updated.id ? updated : p
          ),
        },
      };
    });
  };

  const handleToggleLock = (panelId: string) => {
    updateProject((prev) => {
      if (!prev.storyboard) return prev;
      return {
        ...prev,
        storyboard: {
          ...prev.storyboard,
          panels: prev.storyboard.panels.map((p) =>
            p.id === panelId ? { ...p, locked: !p.locked } : p
          ),
        },
      };
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ProgressSteps
          title="웹툰 콘티를 구성하고 있습니다..."
          steps={[
            { label: "이야기 구조", done: false },
            { label: "컷 구성", done: false },
            { label: "대사", done: false },
            { label: "장면 설명", done: false },
            { label: "마지막 장면", done: false },
          ]}
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-gray-700 text-center">{errorMessage}</p>
        <div className="flex gap-3">
          <Button onClick={runGeneration}>다시 시도</Button>
          <Button variant="secondary" onClick={() => navigate("/workspace")}>
            이야기 선택으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-6xl mx-auto px-4 pt-10 pb-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          {selectedCandidate?.title}
        </h1>
        <p className="text-gray-500 mt-1">
          컷을 클릭해서 자유롭게 수정할 수 있습니다.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {project.storyboard?.panels.map((panel) => (
          <PanelCard
            key={panel.id}
            panel={panel}
            onChange={handlePanelChange}
            onToggleLock={() => handleToggleLock(panel.id)}
          />
        ))}
      </main>
    </div>
  );
}
