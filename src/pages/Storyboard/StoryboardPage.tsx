import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../contexts/ProjectContext";
import {
  generateStoryboard,
  rewritePanel,
  rewriteStory,
} from "../../services/ai/storyboardGenerator";
import { AIServiceError, RateLimitError } from "../../services/ai/aiClient";
import { PanelCard } from "../../components/storyboard/PanelCard";
import { ProgressSteps } from "../../components/common/ProgressSteps";
import { Button } from "../../components/common/Button";
import { generateId } from "../../lib/id";
import type { StoryboardPanel } from "../../types/storyboard";
import { MAX_VERSION_HISTORY_PER_PANEL } from "../../types/storyboard";

function errorMessageOf(err: unknown, fallback: string): string {
  if (err instanceof RateLimitError) return err.message;
  if (err instanceof AIServiceError) return err.message;
  return fallback;
}

export function StoryboardPage() {
  const { project, updateProject } = useProjectContext();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [rewritingPanelId, setRewritingPanelId] = useState<string | null>(
    null
  );
  const [panelErrors, setPanelErrors] = useState<Record<string, string>>({});

  const [storyRewriteRequest, setStoryRewriteRequest] = useState("");
  const [storyRewriting, setStoryRewriting] = useState(false);
  const [storyRewriteError, setStoryRewriteError] = useState<string | null>(
    null
  );

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
      setErrorMessage(
        errorMessageOf(err, "콘티를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.")
      );
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

  const pushVersionHistory = (
    history: Record<string, { panelId: string; panel: StoryboardPanel; savedAt: string }[]>,
    oldPanel: StoryboardPanel
  ) => {
    const existing = history[oldPanel.id] ?? [];
    return {
      ...history,
      [oldPanel.id]: [
        ...existing,
        { panelId: oldPanel.id, panel: oldPanel, savedAt: new Date().toISOString() },
      ].slice(-MAX_VERSION_HISTORY_PER_PANEL),
    };
  };

  const handleRewritePanel = async (panelId: string, userRequest: string) => {
    if (!selectedCandidate || !project.storyboard) return;
    setRewritingPanelId(panelId);
    setPanelErrors((prev) => ({ ...prev, [panelId]: "" }));
    try {
      const newPanel = await rewritePanel(
        selectedCandidate,
        project.storyboard.panels,
        panelId,
        userRequest
      );
      updateProject((prev) => {
        if (!prev.storyboard) return prev;
        const oldPanel = prev.storyboard.panels.find((p) => p.id === panelId);
        const history = oldPanel
          ? pushVersionHistory(prev.storyboard.versionHistory ?? {}, oldPanel)
          : prev.storyboard.versionHistory ?? {};
        return {
          ...prev,
          storyboard: {
            ...prev.storyboard,
            panels: prev.storyboard.panels.map((p) =>
              p.id === panelId ? { ...newPanel, locked: p.locked } : p
            ),
            versionHistory: history,
          },
        };
      });
    } catch (err) {
      setPanelErrors((prev) => ({
        ...prev,
        [panelId]: errorMessageOf(
          err,
          "컷을 다시 작성하지 못했습니다. 잠시 후 다시 시도해주세요."
        ),
      }));
    } finally {
      setRewritingPanelId(null);
    }
  };

  const handleRevertPanel = (panelId: string) => {
    updateProject((prev) => {
      if (!prev.storyboard) return prev;
      const history = prev.storyboard.versionHistory ?? {};
      const stack = history[panelId];
      if (!stack || stack.length === 0) return prev;
      const newStack = stack.slice(0, -1);
      const last = stack[stack.length - 1];
      return {
        ...prev,
        storyboard: {
          ...prev.storyboard,
          panels: prev.storyboard.panels.map((p) =>
            p.id === panelId ? { ...last.panel, locked: p.locked } : p
          ),
          versionHistory: { ...history, [panelId]: newStack },
        },
      };
    });
  };

  const handleRewriteStory = async () => {
    if (!selectedCandidate || !project.storyboard || !storyRewriteRequest.trim()) {
      return;
    }
    setStoryRewriting(true);
    setStoryRewriteError(null);
    try {
      const originalPanels = project.storyboard.panels;
      const newPanels = await rewriteStory(
        selectedCandidate,
        originalPanels,
        storyRewriteRequest.trim()
      );
      updateProject((prev) => {
        if (!prev.storyboard) return prev;
        let history = prev.storyboard.versionHistory ?? {};
        prev.storyboard.panels.forEach((oldPanel) => {
          if (!oldPanel.locked) {
            history = pushVersionHistory(history, oldPanel);
          }
        });
        return {
          ...prev,
          storyboard: {
            ...prev.storyboard,
            panels: newPanels,
            versionHistory: history,
          },
        };
      });
      setStoryRewriteRequest("");
    } catch (err) {
      setStoryRewriteError(
        errorMessageOf(
          err,
          "전체 스토리를 다시 생성하지 못했습니다. 잠시 후 다시 시도해주세요."
        )
      );
    } finally {
      setStoryRewriting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ProgressSteps
          title="웹툰 콘티를 구성하고 있습니다..."
          steps={["이야기 구조", "컷 구성", "대사", "장면 설명", "마지막 장면"]}
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
          컷을 클릭해서 자유롭게 수정하거나, AI에게 다시 작성을 요청할 수 있습니다.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {project.storyboard?.panels.map((panel) => (
          <PanelCard
            key={panel.id}
            panel={panel}
            onChange={handlePanelChange}
            onToggleLock={() => handleToggleLock(panel.id)}
            onRewrite={(req) => handleRewritePanel(panel.id, req)}
            onRevert={() => handleRevertPanel(panel.id)}
            canRevert={
              (project.storyboard?.versionHistory?.[panel.id]?.length ?? 0) > 0
            }
            rewriting={rewritingPanelId === panel.id}
            errorMessage={panelErrors[panel.id]}
          />
        ))}
      </main>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">전체 수정 요청</p>
          <textarea
            value={storyRewriteRequest}
            onChange={(e) => setStoryRewriteRequest(e.target.value)}
            placeholder={'"전체적으로 병맛스럽게 바꿔줘.\n마지막에 예상하지 못한 반전을 넣어줘.\n대사는 짧게 해줘."'}
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          {storyRewriteError && (
            <p className="text-sm text-red-500">{storyRewriteError}</p>
          )}
          <div className="flex justify-end">
            <Button
              onClick={handleRewriteStory}
              disabled={storyRewriting || !storyRewriteRequest.trim()}
            >
              {storyRewriting ? "전체 다시 생성 중..." : "전체 다시 생성"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
