import type { StorySettings, StoryStyle } from "../../types/story";

const STYLE_OPTIONS: { value: StoryStyle; label: string }[] = [
  { value: "auto", label: "자동" },
  { value: "comedy", label: "코미디" },
  { value: "empathy", label: "공감" },
  { value: "touching", label: "감동" },
  { value: "twist", label: "반전" },
  { value: "byungmat", label: "병맛" },
  { value: "daily", label: "일상" },
  { value: "calm", label: "잔잔함" },
];

const PANEL_COUNT_OPTIONS: (8 | 10 | 12)[] = [8, 10, 12];

interface StorySettingsPanelProps {
  settings: StorySettings;
  onChange: (settings: StorySettings) => void;
}

export function StorySettingsPanel({
  settings,
  onChange,
}: StorySettingsPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">분위기</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...settings, style: opt.value })}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                settings.style === opt.value
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder='직접 입력: "조금 날것의 느낌으로 웃기게 만들어줘"'
          value={settings.customMood ?? ""}
          onChange={(e) => onChange({ ...settings, customMood: e.target.value })}
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">컷 수</p>
        <select
          value={settings.panelCount}
          onChange={(e) =>
            onChange({
              ...settings,
              panelCount: Number(e.target.value) as 8 | 10 | 12,
            })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          {PANEL_COUNT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}컷
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
