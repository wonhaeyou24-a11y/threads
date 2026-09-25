/**
 * src/types/material.ts의 MATERIAL_LIMITS와 반드시 같은 값을 유지한다.
 * api/는 src/의 value export에 의존할 수 없으므로(Vercel ESM 모듈 해석 문제) 별도로 둔다.
 */
export const MATERIAL_LIMITS = {
  maxLengthPerMaterial: 500,
  maxMaterialCount: 30,
  maxTotalLength: 3000,
} as const;
