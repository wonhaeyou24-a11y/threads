/**
 * src/lib/id.ts와 동일한 구현을 서버(api/) 측에 독립적으로 둔다.
 * Vercel의 Node 함수는 api/ 바깥(src/)의 value import를 파일 확장자 없이 해석하지 못해
 * ERR_MODULE_NOT_FOUND로 크래시하므로, api/는 src/의 값(런타임) export에 의존하지 않는다.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
