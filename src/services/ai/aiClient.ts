export const AI_MOCK_MODE = import.meta.env.VITE_AI_MOCK === "true";

export class AIServiceError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "AIServiceError";
    this.cause = cause;
  }
}

export class RateLimitError extends AIServiceError {
  constructor(message = "잠시 후 다시 시도해주세요. (요청이 너무 많습니다)") {
    super(message);
    this.name = "RateLimitError";
  }
}

/** 서버(/api) 엔드포인트에 JSON을 POST하고 JSON으로 파싱해 반환한다. Mock 모드에서는 호출하지 않는다. */
export async function postJSON<T>(endpoint: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new AIServiceError("네트워크 오류가 발생했습니다.", err);
  }

  if (response.status === 429) {
    throw new RateLimitError();
  }

  if (!response.ok) {
    let message = "스토리를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
    try {
      const errBody = await response.json();
      if (typeof errBody?.error === "string") message = errBody.error;
    } catch {
      // ignore parse failure, use default message
    }
    throw new AIServiceError(message);
  }

  try {
    return (await response.json()) as T;
  } catch (err) {
    throw new AIServiceError("서버 응답을 처리하지 못했습니다.", err);
  }
}
