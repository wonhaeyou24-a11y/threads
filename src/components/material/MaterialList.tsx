import { useState } from "react";
import type { StoryMaterial } from "../../types/material";

interface MaterialListProps {
  materials: StoryMaterial[];
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

const typeLabel: Record<StoryMaterial["type"], string> = {
  keyword: "단어",
  sentence: "문장",
  story: "이야기",
};

export function MaterialList({ materials, onDelete, onEdit }: MaterialListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (materials.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        아직 입력한 소재가 없습니다.
      </p>
    );
  }

  const startEdit = (m: StoryMaterial) => {
    setEditingId(m.id);
    setDraft(m.content);
  };

  const commitEdit = () => {
    if (editingId && draft.trim()) {
      onEdit(editingId, draft.trim());
    }
    setEditingId(null);
  };

  return (
    <ul className="flex flex-col gap-2">
      {materials.map((m) => (
        <li
          key={m.id}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2"
        >
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 shrink-0">
            {typeLabel[m.type]}
          </span>
          {editingId === m.id ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => e.key === "Enter" && commitEdit()}
              className="flex-1 text-sm border-b border-violet-300 focus:outline-none"
            />
          ) : (
            <span
              className="flex-1 text-sm text-gray-800 cursor-pointer truncate"
              onClick={() => startEdit(m)}
            >
              {m.content}
            </span>
          )}
          <button
            onClick={() => onDelete(m.id)}
            className="text-gray-400 hover:text-red-500 text-sm shrink-0"
            aria-label="삭제"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
