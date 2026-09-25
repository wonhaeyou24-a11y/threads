import type { StoryMaterial, MaterialAnalysis } from "./material";
import type { StoryCandidate, StorySettings } from "./story";
import type { Storyboard } from "./storyboard";

export type ProjectStatus =
  | "material"
  | "story_selection"
  | "storyboard"
  | "completed";

export const CURRENT_SCHEMA_VERSION = 1;

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;

  materials: StoryMaterial[];
  storySettings: StorySettings;
  analysis?: MaterialAnalysis;
  candidates?: StoryCandidate[];
  selectedCandidateId?: string;
  storyboard?: Storyboard;
}
