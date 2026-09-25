export interface StoryboardPanel {
  id: string;
  panelNumber: number;
  scene: string;
  location?: string;
  time?: string;
  characters: string[];
  action: string;
  expression?: string;
  dialogue?: string[];
  narration?: string;
  soundEffect?: string;
  /** V1.0에서는 항상 빈 값("")으로 둔다. V2/V3에서 실제 생성. */
  imagePrompt?: string;
  /** true면 전체 재생성 시 이 컷은 변경하지 않는다. */
  locked?: boolean;
}

export interface StoryboardVersion {
  panelId: string;
  panel: StoryboardPanel;
  savedAt: string;
}

export interface Storyboard {
  id: string;
  storyId: string;
  panelCount: number;
  panels: StoryboardPanel[];
  /** 컷별 직전 버전 최대 5개 보관 (panelId -> 최근 5개, 최신이 배열 마지막) */
  versionHistory?: Record<string, StoryboardVersion[]>;
}

export const MAX_VERSION_HISTORY_PER_PANEL = 5;
