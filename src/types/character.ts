/**
 * V1.0에서는 사용하지 않음. V2.0(캐릭터 관리)에서 확장 예정.
 * 데이터 구조 확장성을 위해 미리 정의해둔다.
 */
export interface Character {
  id: string;
  name: string;
  personality?: string;
  appearance?: string;
  referenceImageUrl?: string;
}
