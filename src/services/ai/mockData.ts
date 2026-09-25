import type { MaterialAnalysis } from "../../types/material";
import type { StoryCandidate } from "../../types/story";
import type { StoryboardPanel } from "../../types/storyboard";

/** Mock 모드 강제 오류 트리거: 소재 내용에 이 문자열이 포함되면 오류를 시뮬레이션한다. (테스트 시나리오 9) */
export const FORCE_ERROR_TRIGGER = "강제오류";

export const mockAnalysis: MaterialAnalysis = {
  characters: ["직장인", "팀장", "강아지"],
  locations: ["회사", "퇴근길"],
  events: ["지각", "비가 옴", "생일"],
  objects: ["우산"],
  emotions: ["당황", "외로움", "기대"],
  themes: ["직장생활", "생일", "일상"],
  possibleConflicts: ["생일인데 아무도 축하하지 않는다"],
  possibleTwists: ["사실 주변 사람들이 생일을 알고 있었다"],
  connections: ["지각한 날이 하필 생일이었다"],
};

export const mockCandidates: StoryCandidate[] = [
  {
    id: "mock-candidate-1",
    title: "아무도 몰랐던 생일",
    genre: "일상 / 공감",
    tone: "따뜻함",
    logline: "아무도 자신의 생일을 기억하지 못했다고 생각한 직장인의 하루.",
    summary:
      "지각한 날 하필 오늘이 생일이었던 주인공은 회사에서도 아무 말이 없어 서운해하지만, 퇴근길에 만난 강아지 덕분에 작은 위로를 받는다.",
    beginning: "지각으로 정신없이 시작된 아침, 아무도 생일을 언급하지 않는다.",
    middle: "하루 종일 외로움을 느끼며 퇴근길에 비를 맞은 강아지를 만난다.",
    ending: "강아지에게 우산을 씌워주며 작은 온기를 느낀다.",
    twist: "사실 동료들은 깜짝 파티를 준비하고 있었다.",
    characters: ["직장인", "강아지"],
    sourceMaterialIds: [],
  },
  {
    id: "mock-candidate-2",
    title: "지각 대소동",
    genre: "코미디",
    tone: "유쾌함",
    logline: "지각한 날 벌어지는 좌충우돌 하루.",
    summary:
      "비까지 겹쳐 최악의 지각을 한 주인공이 팀장 앞에서 변명을 늘어놓다가, 퇴근길 강아지 덕분에 웃음으로 하루를 마무리한다.",
    beginning: "비 오는 날 지각한 주인공, 변명거리를 만들어낸다.",
    middle: "팀장과의 어색한 신경전이 이어진다.",
    ending: "강아지를 만나 엉뚱한 소동 끝에 하루가 마무리된다.",
    characters: ["직장인", "팀장", "강아지"],
    sourceMaterialIds: [],
  },
  {
    id: "mock-candidate-3",
    title: "비 오는 날의 반전",
    genre: "반전",
    tone: "잔잔함",
    logline: "평범한 하루인 줄 알았던 날, 예상치 못한 반전이 기다린다.",
    summary:
      "지각과 생일이 겹친 우울한 하루, 그러나 강아지를 통해 뜻밖의 인연이 시작된다.",
    beginning: "우울하게 시작된 지각한 아침.",
    middle: "비 오는 퇴근길, 강아지 한 마리를 만난다.",
    ending: "그 강아지가 예전에 잃어버렸던 반려견이었다는 것을 깨닫는다.",
    twist: "강아지는 알고 보니 어릴 적 잃어버린 반려견이었다.",
    characters: ["직장인", "강아지"],
    sourceMaterialIds: [],
  },
];

export function buildMockPanels(panelCount: number): StoryboardPanel[] {
  const roles = [
    "상황 제시",
    "사건 발생",
    "문제 확대",
    "갈등",
    "예상하지 못한 전개",
    "긴장/웃음",
    "반전 또는 해결",
    "마지막 한 방",
  ];
  return Array.from({ length: panelCount }, (_, i) => ({
    id: `mock-panel-${i + 1}`,
    panelNumber: i + 1,
    scene: `${roles[Math.min(i, roles.length - 1)]} 장면`,
    location: i % 2 === 0 ? "회사" : "퇴근길",
    characters: ["직장인"],
    action: "예시 행동 묘사",
    expression: "당황",
    dialogue: ["예시 대사"],
    imagePrompt: "",
  }));
}
