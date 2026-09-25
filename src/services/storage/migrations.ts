import { CURRENT_SCHEMA_VERSION, type Project } from "../../types/project";

/**
 * 저장된 프로젝트 데이터를 최신 schemaVersion으로 마이그레이션한다.
 * 버전별 마이그레이션 함수는 이 배열에 순서대로 추가한다.
 */
type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

const migrations: Record<number, Migration> = {
  // 예: 1 -> 2 마이그레이션이 필요해지면 여기에 추가
};

export function migrateProject(raw: unknown): Project {
  let data = raw as Record<string, unknown>;
  let version = typeof data.schemaVersion === "number" ? data.schemaVersion : 1;

  while (version < CURRENT_SCHEMA_VERSION) {
    const migrate = migrations[version];
    if (!migrate) break;
    data = migrate(data);
    version += 1;
  }

  data.schemaVersion = CURRENT_SCHEMA_VERSION;
  return data as unknown as Project;
}
