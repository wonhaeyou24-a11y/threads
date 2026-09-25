import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MaterialInputArea } from "../../components/material/MaterialInputArea";
import { MaterialList } from "../../components/material/MaterialList";
import { StorySettingsPanel } from "../../components/material/StorySettingsPanel";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { useProjectContext } from "../../contexts/ProjectContext";
import { parseMaterialsFromText } from "../../utils/materialParser";
import { validateMaterials } from "../../utils/materialLimits";
import { MATERIAL_LIMITS } from "../../types/material";

export function HomePage() {
  const { project, updateProject } = useProjectContext();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);

  const violations = useMemo(
    () => validateMaterials(project.materials),
    [project.materials]
  );
  const totalLength = project.materials.reduce(
    (sum, m) => sum + m.content.length,
    0
  );

  const handleAddText = (text: string) => {
    const newMaterials = parseMaterialsFromText(text);
    if (newMaterials.length === 0) return;
    updateProject((prev) => ({
      ...prev,
      materials: [...prev.materials, ...newMaterials],
    }));
  };

  const handleDelete = (id: string) => {
    updateProject((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  };

  const handleEdit = (id: string, content: string) => {
    updateProject((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    }));
  };

  const handleCreateStory = () => {
    const blockingViolations = validateMaterials(project.materials);
    if (blockingViolations.length > 0) {
      setNotice(blockingViolations[0].message);
      return;
    }
    setNotice(null);
    navigate("/workspace");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="max-w-3xl mx-auto px-4 pt-6 pb-4">
        <div className="flex justify-end">
          <Link
            to="/projects"
            className="text-xs text-gray-400 hover:text-violet-600"
          >
            내 프로젝트 →
          </Link>
        </div>
        <div className="text-center mt-2">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            INSTA TOON STORY MAKER
          </h1>
          <p className="text-gray-500 mt-1">오늘 어떤 이야기를 만들어볼까요?</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-16 flex flex-col gap-6">
        <input
          value={project.title}
          onChange={(e) =>
            updateProject((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="프로젝트 제목"
          className="w-full text-sm text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-violet-400 focus:outline-none px-1 py-1"
        />

        <Card>
          <MaterialInputArea onAdd={handleAddText} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              입력된 소재 ({project.materials.length}/
              {MATERIAL_LIMITS.maxMaterialCount}, {totalLength}/
              {MATERIAL_LIMITS.maxTotalLength}자)
            </p>
          </div>
          <MaterialList
            materials={project.materials}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
          {violations
            .filter((v) => v.type !== "empty")
            .map((v) => (
              <p key={v.type} className="text-xs text-red-500 mt-2">
                {v.message}
              </p>
            ))}
        </Card>

        <Card>
          <StorySettingsPanel
            settings={project.storySettings}
            onChange={(storySettings) =>
              updateProject((prev) => ({ ...prev, storySettings }))
            }
          />
        </Card>

        {notice && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
            {notice}
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={handleCreateStory} className="px-8 py-3 text-base">
            ✨ 스토리 만들기
          </Button>
        </div>
      </main>
    </div>
  );
}
