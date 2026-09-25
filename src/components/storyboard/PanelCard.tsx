import type { StoryboardPanel } from "../../types/storyboard";
import { Card } from "../common/Card";

interface PanelCardProps {
  panel: StoryboardPanel;
  onChange: (panel: StoryboardPanel) => void;
  onToggleLock: () => void;
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full text-sm rounded-lg border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400";
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={`${className} resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
    </div>
  );
}

export function PanelCard({ panel, onChange, onToggleLock }: PanelCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">
          {String(panel.panelNumber).padStart(2, "0")}
        </span>
        <button
          onClick={onToggleLock}
          title={panel.locked ? "잠금 해제" : "이 컷 잠그기"}
          className={`text-sm px-2 py-0.5 rounded-full ${
            panel.locked
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {panel.locked ? "🔒" : "🔓"}
        </button>
      </div>

      <Field
        label="장면"
        value={panel.scene}
        onChange={(v) => onChange({ ...panel, scene: v })}
        multiline
      />
      <Field
        label="행동"
        value={panel.action}
        onChange={(v) => onChange({ ...panel, action: v })}
        multiline
      />
      <Field
        label="표정"
        value={panel.expression ?? ""}
        onChange={(v) => onChange({ ...panel, expression: v })}
      />
      <Field
        label="대사"
        value={(panel.dialogue ?? []).join("\n")}
        onChange={(v) =>
          onChange({
            ...panel,
            dialogue: v.split("\n").filter((line) => line.length > 0),
          })
        }
        multiline
      />
      <Field
        label="나레이션"
        value={panel.narration ?? ""}
        onChange={(v) => onChange({ ...panel, narration: v })}
      />
    </Card>
  );
}
