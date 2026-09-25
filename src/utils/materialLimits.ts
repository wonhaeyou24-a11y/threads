import { MATERIAL_LIMITS } from "../types/material";
import type { StoryMaterial } from "../types/material";

export interface MaterialLimitViolation {
  type: "count" | "perItemLength" | "totalLength" | "empty";
  message: string;
}

export function validateMaterials(
  materials: StoryMaterial[]
): MaterialLimitViolation[] {
  const violations: MaterialLimitViolation[] = [];

  if (materials.length === 0) {
    violations.push({
      type: "empty",
      message: "이야기나 단어를 하나 이상 입력해주세요.",
    });
    return violations;
  }

  if (materials.length > MATERIAL_LIMITS.maxMaterialCount) {
    violations.push({
      type: "count",
      message: `소재는 최대 ${MATERIAL_LIMITS.maxMaterialCount}개까지 입력할 수 있습니다. (현재 ${materials.length}개)`,
    });
  }

  const overLength = materials.find(
    (m) => m.content.length > MATERIAL_LIMITS.maxLengthPerMaterial
  );
  if (overLength) {
    violations.push({
      type: "perItemLength",
      message: `소재 1개는 최대 ${MATERIAL_LIMITS.maxLengthPerMaterial}자까지 입력할 수 있습니다.`,
    });
  }

  const totalLength = materials.reduce((sum, m) => sum + m.content.length, 0);
  if (totalLength > MATERIAL_LIMITS.maxTotalLength) {
    violations.push({
      type: "totalLength",
      message: `전체 소재 글자수는 최대 ${MATERIAL_LIMITS.maxTotalLength}자까지 입력할 수 있습니다. (현재 ${totalLength}자)`,
    });
  }

  return violations;
}
