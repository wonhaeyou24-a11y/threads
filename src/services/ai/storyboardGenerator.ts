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

/**
 * 컷 하나만 다시 작성한다. 앞뒤 컷과 스토리 전체 맥락을 함께 전달해 흐름이 끊기지 않게 한다 (명세 13번).
 */
export async function rewritePanel(
  candidate: StoryCandidate,
  panels: StoryboardPanel[],
  targetPanelId: string,
  userRequest: string
): Promise<StoryboardPanel> {
  if (AI_MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (userRequest.includes(FORCE_ERROR_TRIGGER)) {
      throw new AIServiceError(
        "컷을 다시 작성하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    }
    const target = panels.find((p) => p.id === targetPanelId);
    if (!target) {
      throw new AIServiceError("컷을 찾을 수 없습니다.");
    }
    return {
      ...target,
      action: `${target.action} (AI 수정: ${userRequest})`,
    };
  }

  const { panel } = await postJSON<{ panel: StoryboardPanel }>(
    "/api/rewrite-panel",
    { candidate, panels, targetPanelId, userRequest }
  );
  return panel;
}

/**
 * 전체 콘티를 다시 구성한다. locked된 컷은 변경하지 않는다 (명세 13-1/14번).
 */
export async function rewriteStory(
  candidate: StoryCandidate,
  panels: StoryboardPanel[],
  userRequest: string
): Promise<StoryboardPanel[]> {
  if (AI_MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (userRequest.includes(FORCE_ERROR_TRIGGER)) {
      throw new AIServiceError(
        "전체 스토리를 다시 생성하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    }
    return panels.map((p) =>
      p.locked
        ? p
        : {
            ...p,
            scene: `${p.scene} (전체 수정: ${userRequest})`,
          }
    );
  }

  const { panels: newPanels } = await postJSON<{ panels: StoryboardPanel[] }>(
    "/api/rewrite-story",
    { candidate, panels, userRequest }
  );
  return newPanels;
}
