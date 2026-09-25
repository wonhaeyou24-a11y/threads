import { z } from "zod";

export const materialAnalysisSchema = z.object({
  characters: z.array(z.string()),
  locations: z.array(z.string()),
  events: z.array(z.string()),
  objects: z.array(z.string()),
  emotions: z.array(z.string()),
  themes: z.array(z.string()),
  possibleConflicts: z.array(z.string()),
  possibleTwists: z.array(z.string()),
  connections: z.array(z.string()),
});

export const storyCandidateSchema = z.object({
  id: z.string(),
  title: z.string(),
  genre: z.string(),
  tone: z.string(),
  logline: z.string(),
  summary: z.string(),
  beginning: z.string(),
  middle: z.string(),
  ending: z.string(),
  twist: z.string().optional(),
  characters: z.array(z.string()),
  sourceMaterialIds: z.array(z.string()),
});

export const analyzeAndGenerateResponseSchema = z.object({
  analysis: materialAnalysisSchema,
  candidates: z.array(storyCandidateSchema).length(3),
});

export const storyboardPanelSchema = z.object({
  id: z.string(),
  panelNumber: z.number(),
  scene: z.string(),
  location: z.string().optional(),
  time: z.string().optional(),
  characters: z.array(z.string()),
  action: z.string(),
  expression: z.string().optional(),
  dialogue: z.array(z.string()).optional(),
  narration: z.string().optional(),
  soundEffect: z.string().optional(),
});

export const generateStoryboardResponseSchema = z.object({
  panels: z.array(storyboardPanelSchema).min(8).max(12),
});

export const rewritePanelResponseSchema = z.object({
  panel: storyboardPanelSchema,
});

export const rewriteStoryResponseSchema = z.object({
  panels: z.array(storyboardPanelSchema).min(8).max(12),
});
