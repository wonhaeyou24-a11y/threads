export type StoryStyle =
  | "auto"
  | "comedy"
  | "empathy"
  | "touching"
  | "twist"
  | "byungmat"
  | "daily"
  | "calm";

export interface StoryCandidate {
  id: string;
  title: string;
  genre: string;
  tone: string;
  logline: string;
  summary: string;
  beginning: string;
  middle: string;
  ending: string;
  twist?: string;
  characters: string[];
  sourceMaterialIds: string[];
}

export interface StorySettings {
  style: StoryStyle;
  customMood?: string;
  panelCount: 8 | 10 | 12;
}
