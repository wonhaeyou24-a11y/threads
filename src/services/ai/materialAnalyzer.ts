import type { StoryMaterial, MaterialAnalysis } from "../../types/material";
import type { StorySettings } from "../../types/story";
import { generateStoryCandidates } from "./storyGenerator";

/**
 * 소재 분석 결과만 필요할 때 사용한다.
 * 내부적으로는 generateStoryCandidates()와 동일한 결합 호출을 사용한다 (명세 6번 효율화 규칙).
 */
export async function analyzeMaterials(
  materials: StoryMaterial[],
  settings: StorySettings
): Promise<MaterialAnalysis> {
  const { analysis } = await generateStoryCandidates(materials, settings);
  return analysis;
}
