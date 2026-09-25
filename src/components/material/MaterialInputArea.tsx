import { useState } from "react";

interface MaterialInputAreaProps {
  onAdd: (text: string) => void;
}

export function MaterialInputArea({ onAdd }: MaterialInputAreaProps) {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"이야기를 자유롭게 입력하세요\n\n회사\n강아지\n오늘 있었던 황당한 일..."}
        rows={8}
        className="w-full resize-none rounded-2xl border border-gray-200 p-4 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
      />
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          소재 추가
        </button>
      </div>
    </div>
  );
}
