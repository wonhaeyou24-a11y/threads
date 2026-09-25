import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../contexts/ProjectContext";
import { generateStoryCandidates } from "../../services/ai/storyGenerator";
import { AIServiceError, RateLimitError } from "../../services/ai/aiClient";
import { StoryCandidateCard } from "../../components/story/StoryCandidateCard";
import { ProgressSteps } from "../../components/common/ProgressSteps";
import { Button } from "../../components/common/Button";
import type { StoryCandidate } from "../../types/story";

const CANDIDATE_LABELS = ["A", "B", "C"];

export function StoryWorkspacePage() {
  const { project, updateProject } = useProjectContext();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runGeneration = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const { analysis, candidates } = await generateStoryCandidates(
        project.materials,
        project.storySettings
      );
      updateProject((prev) => ({
        ...prev,
        analysis,
        candidates,
        status: "story_selection",
      }));
      setStatus("idle");
    } catch (err) {
      const message =
        err instanceof RateLimitError
          ? err.message
          : err instanceof AIServiceError
          ? err.message
          : "스토리를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
      setErrorMessage(message);
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.materials, project.storySettings]);

  useEffect(() => {
    if (project.materials.length === 0) {
      navigate("/", { replace: true });
      return;
    }
    if (!project.candidates || project.candidates.length === 0) {
      runGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (candidate: StoryCandidate) => {
    updateProject((prev) => ({
      ...prev,
      selectedCandidateId: candidate.id,
      status: "storyboard",
    }));
    navigate("/storyboard");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ProgressSteps
          title="소재를 분석하고 스토리 후보를 만들고 있습니다..."
          steps={[
            { label: "등장인물/사건/감정 분석", done: false },
            { label: "이야기 A", done: false },
            { label: "이야기 B", done: false },
            { label: "이야기 C", done: false },
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
          <Button variant="secondary" onClick={() => navigate("/")}>
            소재로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-5xl mx-auto px-4 pt-10 pb-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          어떤 이야기로 만들까요?
        </h1>
        <p className="text-gray-500 mt-1">마음에 드는 이야기를 선택하세요.</p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-16 grid grid-cols-1 md:grid-cols-3 gap-5">
        {project.candidates?.map((candidate, i) => (
          <StoryCandidateCard
            key={candidate.id}
            candidate={candidate}
            label={CANDIDATE_LABELS[i] ?? `${i + 1}`}
            onSelect={() => handleSelect(candidate)}
          />
        ))}
      </main>

      <div className="flex justify-center pb-10">
        <Button variant="secondary" onClick={runGeneration}>
          다른 이야기로 다시 만들기
        </Button>
      </div>
    </div>
  );
}
