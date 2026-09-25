import { useState } from "react";
import type { StoryboardPanel } from "../../types/storyboard";
import { Card } from "../common/Card";
import { Button } from "../common/Button";

interface PanelCardProps {
  panel: StoryboardPanel;
  onChange: (panel: StoryboardPanel) => void;
  onToggleLock: () => void;
  onRewrite: (userRequest: string) => Promise<void>;
  onRevert: () => void;
  canRevert: boolean;
  rewriting: boolean;
  errorMessage?: string | null;
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

export function PanelCard({
  panel,
  onChange,
  onToggleLock,
  onRewrite,
  onRevert,
  canRevert,
  rewriting,
  errorMessage,
}: PanelCardProps) {
  const [rewriteRequest, setRewriteRequest] = useState("");

  const handleRewriteClick = async () => {
    if (!rewriteRequest.trim() || rewriting) return;
    await onRewrite(rewriteRequest.trim());
    setRewriteRequest("");
  };

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

      <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
        <input
          value={rewriteRequest}
          onChange={(e) => setRewriteRequest(e.target.value)}
          placeholder="예: 대사를 더 짧게 해줘"
          className="w-full text-sm rounded-lg border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        {errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 text-xs py-1.5"
            onClick={handleRewriteClick}
            disabled={rewriting || !rewriteRequest.trim()}
          >
            {rewriting ? "AI 다시작성 중..." : "AI 다시작성"}
          </Button>
          <Button
            variant="ghost"
            className="text-xs py-1.5 border border-gray-200"
            onClick={onRevert}
            disabled={!canRevert || rewriting}
          >
            이전 버전
          </Button>
        </div>
      </div>
    </Card>
  );
}
