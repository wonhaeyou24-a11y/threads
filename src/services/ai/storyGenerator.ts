import { generateId } from "../../lib/id";
import type { StoryMaterial, MaterialAnalysis } from "../../types/material";
import type { StoryCandidate, StorySettings } from "../../types/story";
import { AI_MOCK_MODE, AIServiceError, postJSON } from "./aiClient";
import { FORCE_ERROR_TRIGGER, mockAnalysis, mockCandidates } from "./mockData";

export interface AnalyzeAndGenerateResult {
  analysis: MaterialAnalysis;
  candidates: StoryCandidate[];
}

/**
 * 소재 분석 + 스토리 후보 3개 생성을 하나의 호출로 처리한다.
 * (서버리스 함수 타임아웃을 고려한 효율화. 명세 6번 참조)
 */
export async function generateStoryCandidates(
  materials: StoryMaterial[],
  settings: StorySettings
): Promise<AnalyzeAndGenerateResult> {
  if (AI_MOCK_MODE) {
    return mockAnalyzeAndGenerate(materials, settings);
  }

  const result = await postJSON<AnalyzeAndGenerateResult>(
    "/api/analyze-and-generate",
    { materials, settings }
  );

  return {
    ...result,
    candidates: result.candidates.map((c) => ({
      ...c,
      sourceMaterialIds: materials.map((m) => m.id),
    })),
  };
}

async function mockAnalyzeAndGenerate(
  materials: StoryMaterial[],
  settings: StorySettings
): Promise<AnalyzeAndGenerateResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const shouldForceError = materials.some((m) =>
    m.content.includes(FORCE_ERROR_TRIGGER)
  );
  if (shouldForceError) {
    throw new AIServiceError(
      "스토리를 생성하지 못했습니다. 잠시 후 다시 시도해주세요."
    );
  }

  const materialIds = materials.map((m) => m.id);
  const candidates = mockCandidates.map((c, i) => ({
    ...c,
    id: generateId(),
    sourceMaterialIds: materialIds,
    tone: settings.style === "auto" ? c.tone : `${settings.style}-${i}`,
  }));

  return { analysis: mockAnalysis, candidates };
}
