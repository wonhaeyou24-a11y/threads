import { generateId } from "../lib/id";
import type { MaterialType, StoryMaterial } from "../types/material";

/** 규칙 기반 소재 타입 분류. 80자 이상은 story, 그 외는 keyword. AI 판단은 사용하지 않는다. */
const LONG_SENTENCE_THRESHOLD = 80;

export function classifyMaterialType(content: string): MaterialType {
  return content.length >= LONG_SENTENCE_THRESHOLD ? "story" : "keyword";
}

/** 여러 줄 붙여넣기를 줄바꿈 기준으로 개별 소재로 분리한다. */
export function parseMaterialsFromText(text: string): StoryMaterial[] {
  const now = new Date().toISOString();
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      id: generateId(),
      content: line,
      type: classifyMaterialType(line),
      createdAt: now,
    }));
}
