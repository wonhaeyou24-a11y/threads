import { generateId } from "../../lib/id";
import type { StoryCandidate } from "../../types/story";
import type { StoryboardPanel } from "../../types/storyboard";
import { AI_MOCK_MODE, AIServiceError, postJSON } from "./aiClient";
import { buildMockPanels, FORCE_ERROR_TRIGGER } from "./mockData";

export async function generateStoryboard(
  candidate: StoryCandidate,
  panelCount: number
): Promise<StoryboardPanel[]> {
  if (AI_MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (candidate.title.includes(FORCE_ERROR_TRIGGER)) {
      throw new AIServiceError(
        "콘티를 생성하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    }
    return buildMockPanels(panelCount).map((p) => ({ ...p, id: generateId() }));
  }

  const { panels } = await postJSON<{ panels: StoryboardPanel[] }>(
    "/api/generate-storyboard",
    { candidate, panelCount }
  );
  return panels;
}
