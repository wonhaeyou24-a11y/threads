export type MaterialType = "keyword" | "sentence" | "story";

export interface StoryMaterial {
  id: string;
  content: string;
  type: MaterialType;
  source?: string;
  createdAt: string;
}

export const MATERIAL_LIMITS = {
  maxLengthPerMaterial: 500,
  maxMaterialCount: 30,
  maxTotalLength: 3000,
} as const;

export interface MaterialAnalysis {
  characters: string[];
  locations: string[];
  events: string[];
  objects: string[];
  emotions: string[];
  themes: string[];
  possibleConflicts: string[];
  possibleTwists: string[];
  connections: string[];
}
